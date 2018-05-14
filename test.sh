if [ ! -d "./node_modules/jasmine-node" ]; then
  npm install --no-save jasmine-node@1
fi
if [ ! -d "./node_modules/phantomjs" ]; then
  npm install --no-save phantomjs@1.8.2-3
fi

./node_modules/.bin/jasmine-node ./test
./node_modules/.bin/phantomjs test/run-jasmine.js test/jasmine.html


