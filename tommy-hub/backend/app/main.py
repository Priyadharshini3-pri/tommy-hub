import os
import logging
from urllib.parse import urlparse
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

from .routers import auth, customers, products, bills
from .database import DATABASE_URL, SessionLocal

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="TOMMY HUB Billing API",
    description="Backend for the TOMMY HUB luxury apparel billing terminal",
    version="1.0.0",
)

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(bills.router)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    logging.error("Database request failed: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=503,
        content={"detail": "Database unavailable. Check the Supabase connection and schema."},
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "tommy-hub-api"}


@app.get("/api/health/db")
def database_health_check():
    try:
        parsed_url = urlparse(DATABASE_URL)
        try:
            port = parsed_url.port
        except ValueError:
            port = None
        database_target = {
            "configured": bool(os.getenv("DATABASE_URL")),
            "scheme": parsed_url.scheme,
            "host": parsed_url.hostname or "",
            "port": port,
            "username": parsed_url.username or "",
        }
    except ValueError:
        database_target = {
            "configured": bool(os.getenv("DATABASE_URL")),
            "scheme": "invalid",
            "host": "",
            "port": None,
            "username": "",
        }
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logging.error("Database connection check failed: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "service": "tommy-hub-api",
                "database": "unavailable",
                "connection": "failed",
                "schema": "not_checked",
                "database_target": database_target,
            },
        )

    try:
        tables = set(inspect(db.bind).get_table_names())
        required_tables = {"products", "bills", "bill_items", "bill_counters"}
        missing_tables = sorted(required_tables - tables)
        if missing_tables:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "error",
                    "service": "tommy-hub-api",
                    "database": "ok",
                    "connection": "ok",
                    "schema": "missing_tables",
                    "missing_tables": missing_tables,
                    "database_target": database_target,
                },
            )
        return {
            "status": "ok",
            "service": "tommy-hub-api",
            "database": "ok",
            "connection": "ok",
            "schema": "ok",
            "database_target": database_target,
        }
    except SQLAlchemyError as exc:
        logging.error("Database schema check failed: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "service": "tommy-hub-api",
                "database": "ok",
                "connection": "ok",
                "schema": "check_failed",
                "database_target": database_target,
            },
        )
    finally:
        db.close()
