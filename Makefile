.PHONY: setup check check-linux check-deps check-xml check-lua check-xsd check-runner check-tools log-xml hunt-log game-test trials trials-uninstall trial-log help

# Runs Windows PowerShell through WSL interop; override to run it another way
POWERSHELL ?= powershell.exe -NoProfile -ExecutionPolicy Bypass -File

help:
	@echo "SWI Bounty Hunter playthrough: in-game test harness"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup       - npm install, create test.config, and turn on the git hooks in .githooks"
	@echo "  make check       - Offline checks, no game: node_modules matches the lock, XML, test list, macro/faction/ware ids, Lua, 8.00 XSDs, runner, TypeScript tools"
	@echo "  make check-linux - The part of make check CI runs: node_modules, XML, test list, Lua, TypeScript tools (ids skip without test.config)"
	@echo "  make log-xml     - Regenerate extension/swibh/md/swibh_log.xml from the log schema (tools/log/schema.ts)"
	@echo "  make hunt-log LOG=<debuglog.txt> - Add a play session's hunts to data/hunts.csv, rebuild data/hunts-summary.md"
	@echo "  make game-test   - Install the test extension, run the in-game tests in X4 8.00 + SWI, remove it (Windows)"
	@echo "  make trials      - Install the trials extension, start X4 for hand-flown M-rung fights, print the results table after you quit"
	@echo "  make trials-uninstall - Remove the trials extension (after a killed run, or ARGS=-KeepExtension)"
	@echo "  make trial-log LOG=<debuglog.txt> - Print the trials results table from a log"
	@echo "  make help        - Show this help message"
	@echo ""
	@echo "First run: make game-test ARGS=-PrepareProfile  (creates the test profile with SWI switched on)"
	@echo "Extra runner options: make game-test ARGS=\"-KeepExtension -TimeoutSeconds 1800\""
	@echo "T12 on an existing save: make game-test ARGS=-Manual  (load an older save, then quit X4)"

setup:
	@npm install --no-fund --no-audit
	@git config core.hooksPath .githooks
	@if [ -f test.config ]; then \
		echo "test.config already exists"; \
		echo "Edit it to update your X4 paths and test profile id"; \
	else \
		cp test.config.example test.config; \
		echo "Created test.config"; \
		echo "Please edit test.config with your X4 8.00 path and test profile id"; \
	fi

check: check-linux check-xsd check-runner

# The checks with no Windows side; CI (.github/workflows/check.yml) runs this target
check-linux: check-deps check-xml check-lua check-tools

# node_modules (here, or the main checkout's from a worktree) matches package-lock.json; runs first
# so a missing or stale package fails with a clear message instead of "Cannot find package"
check-deps:
	@node tools/check-deps.ts

# Well-formed XML, test list, every macro, faction, ware and loadout named exists in 8.00 or SWI, and MD diff sels match.
# Needs npm install (make setup)
check-xml:
	@node tools/offline-check.ts

# The autostart Lua parses as Lua 5.1 (X4's LuaJIT dialect); -p only parses, runs nothing
check-lua:
	@luac5.1 -p tests/game/swibh_tests/ui/*.lua && echo "Lua: ok"

# The test extension and the swibh extension against X4 8.00's own md.xsd, diff.xsd and gamestarts.xsd (.NET's validator)
check-xsd:
	@$(POWERSHELL) "$$(wslpath -w tools/validate-xml.ps1)" -SchemaDir "$$(node tools/offline-check.ts --get-windows X4_UNPACKED)"
	@$(POWERSHELL) "$$(wslpath -w tools/validate-xml.ps1)" -SchemaDir "$$(node tools/offline-check.ts --get-windows X4_UNPACKED)" -ExtensionDir "$$(wslpath -w extension/swibh)"
	@$(POWERSHELL) "$$(wslpath -w tools/validate-xml.ps1)" -SchemaDir "$$(node tools/offline-check.ts --get-windows X4_UNPACKED)" -ExtensionDir "$$(wslpath -w tests/game/swibh_trials)"

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

# After each play session, on a copy of debuglog.txt (X4 rewrites it at each launch); commit data/
hunt-log:
	@if [ -z "$(LOG)" ]; then echo "Usage: make hunt-log LOG=<copy of debuglog.txt>"; exit 2; fi
	@node tools/hunt-log.ts "$(LOG)"

# The runner installs the test extension itself (and removes it afterwards), so there's no separate deploy.
# Then the log parser reads the run's [swibh] log events from the copy of debuglog.txt it leaves
game-test:
	@$(POWERSHELL) "$$(wslpath -w tools/run-game-tests.ps1)" $(ARGS)
	@case "$(ARGS)" in *-Manual*) ;; *) node tools/log/game-check.ts tests/game/debuglog.txt ;; esac

# Hand-flown M-rung trials (tests/game/trials.md): installs the trials extension, starts X4
# in the test profile and waits until you quit, removes the extension, then prints the results
# table from the log. Close X4 first. ARGS=-KeepExtension leaves the extension installed
trials:
	@$(POWERSHELL) "$$(wslpath -w tools/run-trials.ps1)" $(ARGS)
	@node tools/trial-log.ts tests/game/trials-debuglog.txt

trials-uninstall:
	@$(POWERSHELL) "$$(wslpath -w tools/run-trials.ps1)" -Uninstall

trial-log:
	@if [ -z "$(LOG)" ]; then echo "Usage: make trial-log LOG=<copy of debuglog.txt>"; exit 2; fi
	@node tools/trial-log.ts "$(LOG)"
