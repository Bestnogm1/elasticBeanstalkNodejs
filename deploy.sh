#!/usr/bin/env bash

echo "\033[0;32mSwitching to branch main...\033[0m"
git checkout main || exit 1

echo "\033[0;32mStaging local changes...\033[0m"
git add .
git commit -m "deploy"

echo "\033[0;32mLogging into Heroku...\033[0m"
heroku login

echo "\033[0;32mCloning Heroku repo...\033[0m"
heroku git:clone -a fsc-server-prod || exit 1
cd fsc-server-prod || exit 1

echo "\033[0;32mEnsuring we're up to date with Heroku 'main'...\033[0m"
git fetch heroku
git checkout main
git reset --hard heroku/main

echo "\033[0;32mCopying local code into cloned repository...\033[0m"
cd ..
rsync -av --exclude='fsc-server-prod' ./ fsc-server-prod/
cd fsc-server-prod

echo "\033[0;32mStaging and deploying project to Heroku...\033[0m"
git add .
git commit -m "deploy"
# Force push to override non-fast-forward issues:
git push heroku main --force

echo "\033[0;32mCleaning up cloned repository...\033[0m"
cd ..
rm -rf fsc-server-prod

echo "\033[0;32mProject successfully deployed!\033[0m"
