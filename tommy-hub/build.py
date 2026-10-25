"""Build the Vite frontend into the public directory used by Vercel."""

import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).parent
FRONTEND = ROOT / "frontend"
PUBLIC = ROOT / "public"


def main() -> None:
    subprocess.run(
        ["npm", "--prefix", str(FRONTEND), "install", "--no-audit", "--no-fund"],
        check=True,
    )
    subprocess.run(
        ["npm", "--prefix", str(FRONTEND), "run", "build"],
        check=True,
    )

    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    shutil.copytree(FRONTEND / "dist", PUBLIC)


if __name__ == "__main__":
    main()
