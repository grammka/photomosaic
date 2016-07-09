'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function PhotoMosaic(el, opts, imageUrls) {
  var _this = this;

  var Data = {
    container: null,
    containerWidth: null,
    wrapperWidth: null,
    images: [],
    thumbs: [],
    maxW: null,
    maxH: null
  };

  var options = {
    editable: false,
    sizes: {
      gutter: 5,
      containerMaxHeight: 0.8,
      firstThumbMaxWidth: 0.666,
      firstThumbMaxHeight: 0.666,
      minThumbSize: 100
    }
  };

  function map(arr, callback) {
    return Array.prototype.map.call(arr, callback);
  }

  function each(arr, iterate) {
    for (var i = 0; i < arr.length; i++) {
      iterate(arr[i], i);
    }
  }

  function size(value) {
    return value + 'px';
  }

  function getMinInArray(arr) {
    return Math.min.apply(null, arr);
  }

  function getArraySummary(arr) {
    return arr.reduce(function (sum, curr) {
      return sum + curr;
    }, 0);
  }

  function getAverageInArray(arr) {
    return getArraySummary(arr) / arr.length;
  }

  var PhotoMosaic = {
    compute: function compute(img, w, h) {
      w = w - options.sizes.gutter;
      h = h - options.sizes.gutter;

      return {
        img: img,
        width: w,
        height: h,
        ratio: w / h
      };
    },

    drawMoreBlock: function drawMoreBlock() {
      var block = document.createElement('div');
      var left = document.createElement('div');
      var right = document.createElement('div');

      block.style.padding = '10px 5px 5px';
      block.style.overflow = 'hidden';
      block.style.color = '#666';
      block.style.fontSize = size(13);
      block.style.fontFamily = 'Tahoma, sans-serif';

      left.style.float = 'left';
      left.innerHTML = Data.thumbs.length + ' of ' + Data.images.length;

      right.style.float = 'right';
      right.style.cursor = 'pointer';
      right.innerHTML = 'Show more';

      right.addEventListener('mouseenter', function () {
        right.style.color = '#000';
      });

      right.addEventListener('mouseleave', function () {
        right.style.color = '#666';
      });

      right.addEventListener('click', function () {
        // TODO open more
      });

      block.appendChild(left);
      block.appendChild(right);

      return block;
    },

    drawWrapper: function drawWrapper() {
      var el = document.createElement('div');

      el.style.overflow = 'hidden';
      el.style.margin = '0 auto';
      el.style.width = size(Data.wrapperWidth ? Data.wrapperWidth : Data.containerWidth);
      el.style.margin = '-' + options.sizes.gutter + 'px 0 0 -' + options.sizes.gutter + 'px';

      each(Data.thumbs, function (thumb) {
        el.appendChild(PhotoMosaic.thumbElement(thumb));
      });

      return el;
    },

    drawCard: function drawCard() {
      var el = document.createElement('div');

      el.style.display = 'inline-block';
      el.style.padding = size(5);
      el.style.boxShadow = 'rgba(0,0,0, 0.14) 0 0 1px 1px';

      el.appendChild(PhotoMosaic.drawWrapper());

      if (Data.thumbs.length < Data.images.length) {
        el.appendChild(PhotoMosaic.drawMoreBlock());
      }

      return el;
    },

    appendThumbs: function appendThumbs() {
      Data.container.innerHTML = '';
      Data.container.appendChild(PhotoMosaic.drawCard());
    },

    thumbImgElement: function thumbImgElement(thumb) {
      var imgW = void 0;
      var imgH = void 0;

      if (thumb.ratio > thumb.img.ratio) {
        imgW = thumb.width;
        imgH = thumb.width / thumb.img.ratio;
      } else {
        imgW = thumb.height * thumb.img.ratio;
        imgH = thumb.height;
      }

      thumb.img.el.style.width = size(imgW);
      thumb.img.el.style.height = size(imgH);
      thumb.img.el.style.marginLeft = size((thumb.width - imgW) / 2);
      thumb.img.el.style.marginTop = size((thumb.height - imgH) / 2);

      return thumb.img.el;
    },

    thumbCloseElement: function thumbCloseElement(thumb) {
      var el = document.createElement('div');

      el.addEventListener('mouseenter', function () {
        el.style.backgroundColor = 'rgba(0,0,0, 0.6)';
        el.style.color = '#fff';
      });

      el.addEventListener('mouseleave', function () {
        el.style.backgroundColor = 'rgba(0,0,0, 0.3)';
        el.style.color = '#ddd';
      });

      el.addEventListener('click', function () {
        Data.images.splice(thumb.img.index, 1);

        PhotoMosaic.setIndexes();
        PhotoMosaic.processThumbs();
        PhotoMosaic.appendThumbs();
      });

      el.style.width = size(20);
      el.style.height = size(20);
      el.style.backgroundColor = 'rgba(0,0,0, 0.3)';
      el.style.position = 'absolute';
      el.style.top = 0;
      el.style.right = 0;
      el.style.zIndex = 10;
      el.style.cursor = 'pointer';
      el.style.color = '#ddd';
      el.style.textAlign = 'center';
      el.style.fontSize = size(15);
      el.style.fontFamily = 'Tahoma, sans-serif';

      el.innerHTML = '&times;';

      return el;
    },

    thumbElement: function thumbElement(thumb) {
      var el = document.createElement('div');

      el.style.width = size(thumb.width);
      el.style.height = size(thumb.height);
      el.style.marginTop = size(options.sizes.gutter);
      el.style.marginLeft = size(options.sizes.gutter);
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.style.float = 'left';

      if (options.editable) {
        el.appendChild(PhotoMosaic.thumbCloseElement(thumb));
      }
      el.appendChild(PhotoMosaic.thumbImgElement(thumb));

      return el;
    },

    processInlineThumbs: function processInlineThumbs(images, minH, maxH) {
      var avgRatio = getArraySummary(images.map(function (img) {
        return img.width;
      })) / Data.maxW;
      var minImageHeight = getMinInArray(images.map(function (img) {
        return img.height;
      }));

      var height = maxH < minImageHeight ? maxH : minImageHeight;

      if (height < options.sizes.minThumbSize) {
        height = options.sizes.minThumbSize;
      }

      return images.map(function (img) {
        var tW = Math.floor(img.width / avgRatio);
        var tH = height;

        return PhotoMosaic.compute(img, tW, tH);
      });
    },

    processColumnThumbs: function processColumnThumbs(images, contW, contH) {
      var avgRatio = getArraySummary(images.map(function (img) {
        return img.height;
      })) / contH;
      var minW = getMinInArray(images.map(function (img) {
        return img.width;
      }));

      if (minW < options.sizes.minThumbSize) {
        minW = options.sizes.minThumbSize;
      }

      if (minW > Data.maxW - contW) {
        minW = Data.maxW - contW;
      }

      Data.wrapperWidth += minW;

      var sumH = 0;
      return images.map(function (img, index) {
        var tW = minW;
        var tH = void 0;

        if (index == images.length - 1) {
          tH = contH - sumH;
        } else {
          tH = Math.floor(img.height / avgRatio);
          sumH += tH;
        }

        return PhotoMosaic.compute(img, tW, tH);
      });
    },

    processThumbs: function processThumbs() {
      Data.maxW = Data.containerWidth = Data.container.offsetWidth;
      Data.maxH = Data.maxW * options.sizes.containerMaxHeight;
      Data.wrapperWidth = 0;

      var count = Data.images.length;
      var result = [];
      var orients = '';

      each(Data.images, function (img) {
        if (count < 5) {
          orients += img.orient;
        }
      });

      var commonOrient = void 0;

      if (Data.images[0].width > Data.maxW) {
        var tW = Data.maxW;
        var tH = Data.maxH * options.firstThumbMaxHeight;
        result[0] = PhotoMosaic.compute(Data.images[0], tW, tH);

        commonOrient = 'l'; /* landscape */
      } else {
        var _tW = Data.maxW * options.firstThumbMaxWidth;
        var _tH = Data.maxH;
        result[0] = PhotoMosaic.compute(Data.images[0], _tW, _tH);

        commonOrient = 'p'; /* portrait */
      }

      ////   1   ////////////////////////////////////////////////////////////////////////

      if (count == 1) {
        var _tW2 = void 0,
            _tH2 = void 0;

        if (Data.images[0].width > Data.maxW) {
          _tW2 = Data.maxW;
          _tH2 = Math.floor(_tW2 / Data.images[0].ratio);
        } else {
          _tW2 = Data.images[0].width;
          _tH2 = Data.images[0].height > Data.maxH ? Data.maxH : Data.images[0].height;
        }

        result[0] = PhotoMosaic.compute(Data.images[0], _tW2, _tH2);
      }

      ////   2   ////////////////////////////////////////////////////////////////////

      else if (count == 2) {
          if (orients == 'll') {
            // TODO check if Images width is more than Container's

            result[0] = PhotoMosaic.compute(Data.images[0], Data.maxW, Math.floor(Data.maxW / Data.images[0].ratio));
            result[1] = PhotoMosaic.compute(Data.images[1], Data.maxW, Math.floor(Data.maxW / Data.images[1].ratio));
          } else {
            result = PhotoMosaic.processInlineThumbs(Data.images);
          }
        }

        ////   3   ///////////////////////////////////////////////////////////////////

        else if (count == 3) {
            if (commonOrient == 'l') {
              var _tW3 = Data.maxW;
              var _tH3 = Math.floor(Data.maxW / Data.images[0].ratio);

              result[0] = PhotoMosaic.compute(Data.images[0], _tW3, _tH3);
              result = [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processInlineThumbs(Data.images.slice(1))));
            } else if (commonOrient == 'p') {
              var _tW4 = Data.maxW * options.sizes.firstThumbMaxWidth;
              var _tH4 = Math.floor(_tW4 / Data.images[0].ratio);

              if (_tH4 > Data.maxH) {
                _tH4 = Data.maxH;
                _tW4 = Data.maxH * Data.images[0].ratio;
              }

              Data.wrapperWidth += _tW4;

              result[0] = PhotoMosaic.compute(Data.images[0], _tW4, _tH4);
              result = [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processColumnThumbs(Data.images.slice(1), _tW4, _tH4)));
            }
          }

          ////   4   ///////////////////////////////////////////////////////////////////

          else if (count == 4) {
              if (commonOrient == 'l') {
                var _tW5 = Data.maxW;
                var _tH5 = Math.floor(Data.maxW / Data.images[0].ratio);

                result[0] = PhotoMosaic.compute(Data.images[0], _tW5, _tH5);
                result = [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processInlineThumbs(Data.images.slice(1))));
              } else if (commonOrient == 'p') {
                var _tW6 = Data.maxW * options.sizes.firstThumbMaxWidth;
                var _tH6 = Math.floor(_tW6 / Data.images[0].ratio);

                if (_tH6 > Data.maxH) {
                  _tH6 = Data.maxH;
                  _tW6 = Data.maxH * Data.images[0].ratio;
                }

                Data.wrapperWidth += _tW6;

                result[0] = PhotoMosaic.compute(Data.images[0], _tW6, _tH6);
                result = [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processColumnThumbs(Data.images.slice(1), _tW6, _tH6)));
              }
            }

            ////   5+   ////////////////////////////////////////////////////////////////////

            else {
                (function () {
                  var calculate = function calculate(line) {
                    var avgH = void 0;
                    var minH = void 0;
                    var items = void 0;

                    if (line.length == 1) {
                      avgH = line[0].height;
                      minH = line[0].height;
                      items = line;
                    } else {
                      avgH = getAverageInArray(line.map(function (img) {
                        return img.height;
                      }));
                      minH = getMinInArray(line.map(function (img) {
                        return img.height;
                      }));
                      items = line;
                    }

                    return { avgH: avgH, minH: minH, items: items };
                  };

                  var lines = [];
                  var line = [];
                  var lineWidth = 0;

                  each(Data.images, function (img, index) {
                    line[line.length] = img;
                    lineWidth += img.width;

                    if (lineWidth > Data.maxW) {
                      lines[lines.length] = calculate(line);

                      line = [];
                      lineWidth = 0;
                    } else if (index == Data.images.length - 1) {
                      lines[lines.length] = calculate(line);
                    }
                  });

                  var sumLinesHeight = getArraySummary(lines.map(function (line) {
                    return line.avgH;
                  }));
                  var linesHeightRatio = sumLinesHeight / Data.maxH;

                  if (linesHeightRatio > 1.2) {
                    if (commonOrient == 'l') {
                      var _tW7 = Data.maxW;
                      var _tH7 = Math.floor(Data.maxW / Data.images[0].ratio);

                      result[0] = PhotoMosaic.compute(Data.images[0], _tW7, _tH7);
                      result = [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processInlineThumbs(Data.images.slice(1, 4))));
                    } else if (commonOrient == 'p') {
                      var _tW8 = Data.maxW * options.sizes.firstThumbMaxWidth;
                      var _tH8 = Math.floor(_tW8 / Data.images[0].ratio);

                      if (_tH8 > Data.maxH) {
                        _tH8 = Data.maxH;
                        _tW8 = Data.maxH * Data.images[0].ratio;
                      }

                      Data.wrapperWidth += _tW8;

                      result[0] = PhotoMosaic.compute(Data.images[0], _tW8, _tH8);
                      result = [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processColumnThumbs(Data.images.slice(1, 4), _tW8, _tH8)));
                    }
                  } else {
                    each(lines, function (line) {
                      line.maxH = line.avgH / linesHeightRatio;
                    });

                    result = lines.reduce(function (result, line) {
                      return [].concat(_toConsumableArray(result), _toConsumableArray(PhotoMosaic.processInlineThumbs(line.items, line.minH, line.maxH)));
                    }, []);
                  }
                })();
              }

      Data.thumbs = result;
    },

    setIndexes: function setIndexes() {
      Data.images.map(function (img, index) {
        img.index = index;
      });
    },

    loadImages: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(imageUrls) {
        var loadedImages;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return Promise.all(imageUrls.map(function (url) {
                  return new Promise(function (resolve) {
                    var img = new Image();
                    img.onload = function () {
                      var params = {};

                      params.el = img;
                      params.ratio = img.width / img.height;
                      params.orient = params.ratio > 1.2 ? 'l' /* landscape */ : params.ratio < 0.8 ? 'p' /* portrait */ : 'q'; /* quadratic */

                      if (img.width < options.sizes.minThumbSize) {
                        params.width = options.sizes.minThumbSize;
                        params.height = options.sizes.minThumbSize / params.ratio;
                      } else if (img.height < options.sizes.minThumbSize) {
                        params.width = options.sizes.minThumbSize * params.ratio;
                        params.height = options.sizes.minThumbSize;
                      } else {
                        params.width = img.width;
                        params.height = img.height;
                        params.ratio = img.width / img.height;
                      }

                      resolve(params);
                    };
                    img.src = url;
                  });
                }));

              case 2:
                loadedImages = _context.sent;


                Data.images = [].concat(_toConsumableArray(Data.images), _toConsumableArray(loadedImages));

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function loadImages(_x) {
        return _ref.apply(this, arguments);
      };
    }(),

    init: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(el, opts, imageUrls) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                Data.container = typeof el == 'string' ? document.getElementById(el) : el;
                options = _extends({}, options, opts);

                if (!imageUrls) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 5;
                return PhotoMosaic.loadImages(imageUrls);

              case 5:

                PhotoMosaic.setIndexes();
                PhotoMosaic.processThumbs();
                PhotoMosaic.appendThumbs();

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this);
      }));

      return function init(_x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }()
  };

  PhotoMosaic.init(el, opts, imageUrls);
}

exports.default = PhotoMosaic;