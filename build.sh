if [ ! -d "./node_modules/uglify-js" ]; then
  npm install uglify-js@2
fi
if [ ! -d "./node_modules/docco" ]; then
  npm install docco@0
fi
if [ ! -d "./node_modules/jshint" ]; then
  npm install jshint@2
fi


./node_modules/.bin/uglifyjs gex.js -c "evaluate=false" --comments "/ Copyright .*/" -m --source-map gex-min.map -o gex-min.js
./node_modules/.bin/jshint gex.js
./node_modules/.bin/docco gex.js -o doc
cp -r doc/* ../gh-pages/gex/doc
