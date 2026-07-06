@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
REM Secrets (OMNIDIM_API_KEY, OMNIDIM_AGENT_ID, etc.) live in run-dev.local.cmd,
REM which is git-ignored. Copy run-dev.local.cmd.example to run-dev.local.cmd and
REM fill in your keys. This keeps secrets out of version control.
if exist "%~dp0run-dev.local.cmd" call "%~dp0run-dev.local.cmd"
cd /d "%~dp0"
call "%~dp0mvnw.cmd" spring-boot:run
