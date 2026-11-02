.PHONY: setup check check-xml check-lua check-xsd check-runner check-tools log-xml game-test help

# Runs Windows PowerShell through WSL interop; override to run it another way
POWERSHELL ?= powershell.exe -NoProfile -ExecutionPolicy Bypass -File
PYTHON ?= python3 -I

help:
	@echo "SWI Bounty Hunter playthrough: in-game test harness"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup       - Create test.config from test.config.example"
	@echo "  make check       - Offline checks, no game: XML, test list, macro/faction/ware ids, Lua, 8.00 XSDs, runner, TypeScript tools"
	@echo "  make log-xml     - Regenerate extension/swibh/md/swibh_log.xml from the log schema (tools/log/schema.ts)"
	@echo "  make game-test   - Install the test extension, run the in-game tests in X4 8.00 + SWI, remove it (Windows)"
	@echo "  make help        - Show this help message"
	@echo ""
	@echo "First run: make game-test ARGS=-PrepareProfile  (creates the test profile with SWI switched on)"
	@echo "Extra runner options: make game-test ARGS=\"-KeepExtension -TimeoutSeconds 1800\""

setup:
	@npm install --no-fund --no-audit
	@if [ -f test.config ]; then \
		echo "test.config already exists"; \
		echo "Edit it to update your X4 paths and test profile id"; \
	else \
		cp test.config.example test.config; \
		echo "Created test.config"; \
		echo "Please edit test.config with your X4 8.00 path and test profile id"; \
	fi

check: check-xml check-lua check-xsd check-runner check-tools

# Well-formed XML, test list, and every macro, faction and ware named exists in 8.00 or SWI
check-xml:
	@$(PYTHON) tools/check_game_tests.py

# The autostart Lua parses as Lua 5.1 (X4's LuaJIT dialect); -p only parses, runs nothing
check-lua:
	@luac5.1 -p tests/game/swibh_tests/ui/*.lua && echo "Lua: ok"

# The test extension and the swibh extension against X4 8.00's own md.xsd, diff.xsd and gamestarts.xsd (.NET's validator)
check-xsd:
	@$(POWERSHELL) "$$(wslpath -w tools/validate-xml.ps1)" -SchemaDir "$$($(PYTHON) tools/check_game_tests.py --get-windows X4_UNPACKED)"
	@$(POWERSHELL) "$$(wslpath -w tools/validate-xml.ps1)" -SchemaDir "$$($(PYTHON) tools/check_game_tests.py --get-windows X4_UNPACKED)" -ExtensionDir "$$(wslpath -w extension/swibh)"

# The runner's log parsing and reports against sample log lines
check-runner:
	@$(POWERSHELL) "$$(wslpath -w tests/GameTests.Check.ps1)"

# The TypeScript tools (tools/*.ts) type check, and their tests pass. Needs npm install (make setup).
# The tests include tools/log's check that swibh_log.xml matches the log schema
check-tools:
	@npx --no-install tsc && echo "TypeScript: ok"
	@node --test --test-reporter=dot 'tools/**/*.test.ts'

# The MD library for log events, generated from the log schema (ADR 0001); commit the result
log-xml:
	@node tools/log/generate.ts && echo "Wrote extension/swibh/md/swibh_log.xml"

# The runner installs the test extension itself (and removes it afterwards), so there's no separate deploy
game-test:
	@$(POWERSHELL) "$$(wslpath -w tools/run-game-tests.ps1)" $(ARGS)
