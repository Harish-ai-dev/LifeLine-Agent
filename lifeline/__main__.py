"""
lifeline/__main__.py

Allows running the CLI as a module:
    python -m lifeline
    python -m lifeline run
    python -m lifeline --help
"""
from lifeline.cli import main

if __name__ == "__main__":
    main()
