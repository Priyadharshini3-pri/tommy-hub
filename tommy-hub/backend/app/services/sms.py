"""
SMS dispatch service — abstracted behind SMSProvider so the real gateway
(Fast2SMS, Twilio, etc.) can be swapped in via environment variables without
touching route code.
"""
import os
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("tommy_hub.sms")


class SMSProvider(ABC):
    @abstractmethod
    def send(self, phone: str, message: str) -> bool:
        ...


class MockSMSProvider(SMSProvider):
    """Used in dev/test — logs instead of sending a real SMS."""

    def send(self, phone: str, message: str) -> bool:
        logger.info(f"[MOCK SMS] to {phone}: {message}")
        return True


class Fast2SMSProvider(SMSProvider):
    def __init__(self):
        self.api_key = os.getenv("FAST2SMS_API_KEY")

    def send(self, phone: str, message: str) -> bool:
        import requests  # local import keeps mock mode dependency-free

        if not self.api_key:
            logger.error("FAST2SMS_API_KEY not configured")
            return False
        try:
            resp = requests.post(
                "https://www.fast2sms.com/dev/bulkV2",
                headers={"authorization": self.api_key},
                data={"route": "q", "message": message, "language": "english", "flash": 0, "numbers": phone},
                timeout=10,
            )
            return resp.ok
        except Exception as exc:  # noqa: BLE001
            logger.exception(f"Fast2SMS send failed: {exc}")
            return False


class TwilioProvider(SMSProvider):
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_FROM_NUMBER")

    def send(self, phone: str, message: str) -> bool:
        from twilio.rest import Client  # optional dependency, only needed in prod

        if not all([self.account_sid, self.auth_token, self.from_number]):
            logger.error("Twilio credentials not fully configured")
            return False
        try:
            client = Client(self.account_sid, self.auth_token)
            client.messages.create(body=message, from_=self.from_number, to=f"+91{phone}")
            return True
        except Exception as exc:  # noqa: BLE001
            logger.exception(f"Twilio send failed: {exc}")
            return False


def get_sms_provider() -> SMSProvider:
    provider = os.getenv("SMS_PROVIDER", "mock").lower()
    if provider == "fast2sms":
        return Fast2SMSProvider()
    if provider == "twilio":
        return TwilioProvider()
    return MockSMSProvider()


def build_bill_sms(customer_name: str, bill_number: str, grand_total: str) -> str:
    return (
        f"Dear {customer_name}, thank you for shopping at TOMMY HUB! "
        f"Bill {bill_number} | Total: Rs.{grand_total}. Visit again!"
    )
