
const path = require('path');

const name = 'all.min';
module.exports = {
    entry: './public/js_edit/' + name + '.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: name + '.js'
    }
};