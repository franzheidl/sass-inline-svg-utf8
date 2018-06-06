var fs = require('fs');
var path = require('path');
var sass = require('node-sass');
var mime = require('mime');
var replaceall = require('replaceall');


var inlineImage = function(getSvgFile, replace, done) {

    var data = getSvgFile();
    var result = data.toString('utf8');
    if (replace.getLength()) {
      for (var i = 0; i < replace.getLength(); i++) {
        result = replaceall(replace.getKey(i).getValue(), replace.getValue(i).getValue(), result);
      }
    }
    done(result);
}


var buildGetSvgFile =  function(sassFilePath, svgFilePath, iconsDirPath, includePath) {
    const relativeToBuildPath = (filePath) =>
        () => path.resolve(__dirname,filePath);

    const relativeToDirectoryPath = (dir, filePath) =>
        () =>  dir  ? path.resolve(dir,filePath) : '';

    const relativeToCurrentFilePath = (currentFile, relativePath) =>
        () => currentFile ? path.resolve(path.dirname(currentFile),relativePath) : '';

    const relativeToIncludePaths = (includePaths, svgFilePath) =>
        includePaths ? includePaths.split(':').map(includePath => () => path.resolve(includePath,svgFilePath)) : [() => ''];

    return () => {
        const stategies = [
            relativeToBuildPath(svgFilePath),
            relativeToDirectoryPath(iconsDirPath, svgFilePath),
            ...relativeToIncludePaths(includePath,svgFilePath),
            relativeToCurrentFilePath(sassFilePath, svgFilePath)
        ];
        const result = stategies
            .map(getPath => getPath())
            .filter(filePath => "" !== filePath)
            .reduce((result, filePath) => {
                if(result.data) {
                    return result;
                }
                if(!fs.existsSync(filePath)) {
                    result.error = new Error('File ' + filePath + ' does not exist');
                } else if (mime.lookup(filePath) !== 'image/svg+xml') {
                    result.error = new Error('File ' + filePath + ' is not of type image/svg+xml.');
                } else {
                    const data = fs.readFileSync(filePath);
                    if(!data && !data.length) {
                        result.error = new Error('File ' + filePath + ' is empty or cannot be read');
                    } else {
                        delete result.error;
                        result.data = data;
                    }
                }
                return result;
            }, {});
        if(result.error){
            throw result.error;
        }
        return result.data;
    }

};


module.exports = function(iconDirPath) {
  return {
    'inline-svg($filename, $replace: ())': function(filename, replace, done) {
      var getSvgFile = buildGetSvgFile(this.options.file, filename.getValue(),iconDirPath, this.options.includePaths);
      inlineImage(getSvgFile, replace, function(dataUrl) {
        var encodedUrl = encodeURIComponent(dataUrl);        
        done(new sass.types.String('url(\'data:image/svg+xml;charset=utf-8,' + encodedUrl + '\')'));
      });
    }
  }
}
