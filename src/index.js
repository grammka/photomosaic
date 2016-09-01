import merge from 'lodash.merge'


function PhotoMosaic(el, opts, imageUrls) {
  let Data = {
    container: null,
    containerWidth: null,
    wrapperWidth: null,
    images: [],
    thumbs: [],
    maxW: null,
    maxH: null
  }

  let options = {
    editable: false,
    showMoreTitle: null,
    sizes: {
      gutter: 5,
      containerMaxWidth: null,
      containerMaxHeight: 0.8,
      firstThumbMaxWidth: 0.666,
      firstThumbMaxHeight: 0.666,
      minThumbSize: 100
    }
  }


  function map(arr, callback) {
    return Array.prototype.map.call(arr, callback)
  }

  function each(arr, iterate) {
    for (let i = 0; i < arr.length; i++) {
      iterate(arr[i], i)
    }
  }

  function size(value) {
    return `${ value }px`
  }

  function getMinInArray(arr) {
    return Math.min.apply(null, arr)
  }

  function getArraySummary(arr) {
    return arr.reduce((sum, curr) => {
      return sum + curr
    }, 0)
  }

  function getAverageInArray(arr) {
    return getArraySummary(arr) / arr.length
  }


  const PhotoMosaic = {
    compute: (img, w, h) => {
      w = w - options.sizes.gutter
      h = h - options.sizes.gutter

      return {
        img,
        width: w,
        height: h,
        ratio: w / h
      }
    },

    drawMoreBlock: () => {
      const block = document.createElement('div')
      const left  = document.createElement('div')
      const right = document.createElement('div')

      block.style.padding       = '10px 5px 5px'
      block.style.overflow      = 'hidden'
      block.style.color         = '#666'
      block.style.fontSize      = size(13)
      block.style.fontFamily    = 'Tahoma, sans-serif'

      left.style.float    = 'left'
      left.innerHTML      = `${ Data.thumbs.length } ${ options.imagesOfCountText || 'of' } ${ Data.images.length }`

      right.style.float   = 'right'
      right.style.cursor  = 'pointer'
      right.innerHTML     = options.showMoreTitle || 'Show more'

      right.addEventListener('mouseenter', () => {
        right.style.color = '#000'
      })

      right.addEventListener('mouseleave', () => {
        right.style.color = '#666'
      })

      if (typeof options.onShowMore == 'function') {
        right.addEventListener('click', () => {
          options.onShowMore()
        })
      }



      block.appendChild(left)
      block.appendChild(right)

      return block
    },

    drawWrapper: () => {
      const el = document.createElement('div')

      el.style.overflow    = 'hidden'
      el.style.margin      = '0 auto'
      el.style.width       = size(Data.wrapperWidth ? Data.wrapperWidth : Data.containerWidth)
      el.style.margin      = `-${ options.sizes.gutter }px 0 0 -${ options.sizes.gutter }px`

      each(Data.thumbs, (thumb) => {
        el.appendChild(PhotoMosaic.thumbElement(thumb))
      })

      return el
    },

    drawCard: () => {
      const el = document.createElement('div')

      el.style.display          = 'inline-block'
      el.style.backgroundColor  = '#fff'
      el.style.padding          = size(options.sizes.gutter)
      el.style.boxShadow        = 'rgba(0,0,0, 0.14) 0 0 1px 1px'

      el.appendChild(PhotoMosaic.drawWrapper())

      if (Data.thumbs.length < Data.images.length) {
        el.appendChild(PhotoMosaic.drawMoreBlock())
      }

      return el
    },

    appendThumbs: () => {
      Data.container.innerHTML = ''
      Data.container.appendChild(PhotoMosaic.drawCard())
    },

    thumbImgElement: (thumb) => {
      let imgW
      let imgH

      if (thumb.ratio > thumb.img.ratio) {
        imgW = thumb.width
        imgH = thumb.width / thumb.img.ratio
      } else {
        imgW = thumb.height * thumb.img.ratio
        imgH = thumb.height
      }

      thumb.img.el.style.width        = size(imgW)
      thumb.img.el.style.height       = size(imgH)
      thumb.img.el.style.marginLeft   = size((thumb.width - imgW) / 2)
      thumb.img.el.style.marginTop    = size((thumb.height - imgH) / 2)

      return thumb.img.el
    },

    thumbCloseElement: (thumb) => {
      const el = document.createElement('div')

      el.addEventListener('mouseenter', () => {
        el.style.backgroundColor  = 'rgba(0,0,0, 0.6)'
        el.style.color            = '#fff'
      })

      el.addEventListener('mouseleave', () => {
        el.style.backgroundColor  = 'rgba(0,0,0, 0.3)'
        el.style.color            = '#ddd'
      })

      el.addEventListener('click', () => {
        Data.images.splice(thumb.img.index, 1)

        PhotoMosaic.setIndexes()
        PhotoMosaic.processThumbs()
        PhotoMosaic.appendThumbs()
      })

      el.style.width            = size(20)
      el.style.height           = size(20)
      el.style.backgroundColor  = 'rgba(0,0,0, 0.3)'
      el.style.position         = 'absolute'
      el.style.top              = 0
      el.style.right            = 0
      el.style.zIndex           = 10
      el.style.cursor           = 'pointer'
      el.style.color            = '#ddd'
      el.style.textAlign        = 'center'
      el.style.fontSize         = size(15)
      el.style.fontFamily       = 'Tahoma, sans-serif'

      el.innerHTML = '&times;'

      return el
    },

    thumbElement: (thumb) => {
      const el = document.createElement('div')

      el.style.width      = size(thumb.width)
      el.style.height     = size(thumb.height)
      el.style.marginTop  = size(options.sizes.gutter)
      el.style.marginLeft = size(options.sizes.gutter)
      el.style.position   = 'relative'
      el.style.overflow   = 'hidden'
      el.style.float      = 'left'

      if (typeof options.onImageClick == 'function') {
        el.addEventListener('click', () => {
          options.onImageClick(thumb.img.index)
        })
      }

      if (options.editable) {
        el.appendChild(PhotoMosaic.thumbCloseElement(thumb))
      }

      el.appendChild(PhotoMosaic.thumbImgElement(thumb))

      return el
    },

    processInlineThumbs: (images, minH, maxH) => {
      const avgRatio        = getArraySummary(images.map((img) => img.width)) / Data.maxW
      const minImageHeight  = getMinInArray(images.map((img) => img.height))

      let height = maxH < minImageHeight ? maxH : minImageHeight

      if (height < options.sizes.minThumbSize) {
        height = options.sizes.minThumbSize
      }

      return images.map((img) => {
        const tW = Math.floor(img.width / avgRatio)
        const tH = height

        return PhotoMosaic.compute(img, tW, tH)
      })
    },

    processColumnThumbs: (images, contW, contH) => {
      const avgRatio  = getArraySummary(images.map((img) => img.height)) / contH
      let minW        = getMinInArray(images.map((img) => img.width))

      if (minW < options.sizes.minThumbSize) {
        minW = options.sizes.minThumbSize
      }

      if (minW > Data.maxW - contW) {
        minW = Data.maxW - contW
      }

      Data.wrapperWidth += minW

      let sumH = 0
      return images.map((img, index) => {
        const tW = minW
        let tH

        if (index == images.length - 1) {
          tH = contH - sumH
        } else {
          tH = Math.floor(img.height / avgRatio)
          sumH += tH
        }

        return PhotoMosaic.compute(img, tW, tH)
      })
    },

    processThumbs: () => {
      Data.maxW          = Data.containerWidth = Data.container.offsetWidth - options.sizes.gutter * 2
      Data.maxH          = Data.maxW * options.sizes.containerMaxHeight
      Data.wrapperWidth  = 0

      const count   = Data.images.length
      let result    = []
      let orients   = ''

      each(Data.images, (img) => {
        if (count < 5) {
          orients += img.orient
        }
      })


      let commonOrient

      if (Data.images[0].width > Data.maxW) {
        const tW = Data.maxW
        const tH = Data.maxH * options.firstThumbMaxHeight
        result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)

        commonOrient = 'l' /* landscape */
      }
      else {
        const tW = Data.maxW * options.firstThumbMaxWidth
        const tH = Data.maxH
        result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)

        commonOrient = 'p' /* portrait */
      }


      ////   1   ////////////////////////////////////////////////////////////////////////

      if (count == 1) {
        let tW, tH

        if (Data.images[0].width > Data.maxW) {
          tW = Data.maxW
          tH = Math.floor(tW / Data.images[0].ratio)
        } else {
          tW = Data.images[0].width
          tH = Data.images[0].height > Data.maxH ? Data.maxH : Data.images[0].height
        }

        result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
      }


      ////   2   ////////////////////////////////////////////////////////////////////

      else if (count == 2) {
        if (orients == 'll') {
          // TODO check if Images width is more than Container's

          result[0] = PhotoMosaic.compute(Data.images[0], Data.maxW,  Math.floor(Data.maxW / Data.images[0].ratio))
          result[1] = PhotoMosaic.compute(Data.images[1], Data.maxW,  Math.floor(Data.maxW / Data.images[1].ratio))
        }
        else {
          result = PhotoMosaic.processInlineThumbs(Data.images)
        }
      }


      ////   3   ///////////////////////////////////////////////////////////////////

      else if (count == 3) {
        if (commonOrient == 'l') {
          const tW = Data.maxW
          const tH = Math.floor(Data.maxW / Data.images[0].ratio)

          result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
          result = [ ...result, ...PhotoMosaic.processInlineThumbs(Data.images.slice(1)) ]
        }
        else if (commonOrient == 'p') {
          let tW = Data.maxW * options.sizes.firstThumbMaxWidth
          let tH = Math.floor(tW / Data.images[0].ratio)

          if (tH > Data.maxH) {
            tH = Data.maxH
            tW = Data.maxH * Data.images[0].ratio
          }

          Data.wrapperWidth += tW

          result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
          result = [ ...result, ...PhotoMosaic.processColumnThumbs(Data.images.slice(1), tW, tH) ]
        }
      }


      ////   4   ///////////////////////////////////////////////////////////////////

      else if (count == 4) {
        if (commonOrient == 'l') {
          const tW = Data.maxW
          const tH = Math.floor(Data.maxW / Data.images[0].ratio)

          result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
          result = [ ...result, ...PhotoMosaic.processInlineThumbs(Data.images.slice(1)) ]
        }
        else if (commonOrient == 'p') {
          let tW = Data.maxW * options.sizes.firstThumbMaxWidth
          let tH = Math.floor(tW / Data.images[0].ratio)

          if (tH > Data.maxH) {
            tH = Data.maxH
            tW = Data.maxH * Data.images[0].ratio
          }

          Data.wrapperWidth += tW

          result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
          result = [ ...result, ...PhotoMosaic.processColumnThumbs(Data.images.slice(1), tW, tH) ]
        }
      }


      ////   5+   ////////////////////////////////////////////////////////////////////

      else {
        let lines = []
        let line = []
        let lineWidth = 0

        function calculate(line) {
          let avgH
          let minH
          let items

          if (line.length == 1) {
            avgH  = line[0].height
            minH  = line[0].height
            items = line
          }
          else {
            avgH  = getAverageInArray(line.map((img) => img.height))
            minH  = getMinInArray(line.map((img) => img.height))
            items = line
          }

          return { avgH, minH, items }
        }

        each(Data.images, (img, index) => {
          line[line.length] = img
          lineWidth += img.width

          if (lineWidth > Data.maxW) {
            lines[lines.length] = calculate(line)

            line = []
            lineWidth = 0
          }
          else if (index == Data.images.length - 1) {
            lines[lines.length] = calculate(line)
          }
        })

        const sumLinesHeight    = getArraySummary(lines.map((line) => line.avgH))
        const linesHeightRatio  = sumLinesHeight / Data.maxH

        if (linesHeightRatio > 1.2) {
          if (commonOrient == 'l') {
            const tW = Data.maxW
            const tH = Math.floor(Data.maxW / Data.images[0].ratio)

            result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
            result = [ ...result, ...PhotoMosaic.processInlineThumbs(Data.images.slice(1, 4)) ]
          }
          else if (commonOrient == 'p') {
            let tW = Data.maxW * options.sizes.firstThumbMaxWidth
            let tH = Math.floor(tW / Data.images[0].ratio)

            if (tH > Data.maxH) {
              tH = Data.maxH
              tW = Data.maxH * Data.images[0].ratio
            }

            Data.wrapperWidth += tW

            result[0] = PhotoMosaic.compute(Data.images[0], tW, tH)
            result = [ ...result, ...PhotoMosaic.processColumnThumbs(Data.images.slice(1, 4), tW, tH) ]
          }
        }
        else {
          each(lines, (line) => {
            line.maxH = line.avgH / linesHeightRatio
          })

          result = lines.reduce((result, line) => {
            return [ ...result, ...PhotoMosaic.processInlineThumbs(line.items, line.minH, line.maxH) ]
          }, [])
        }
      }

      Data.thumbs = result
    },

    setIndexes: () => {
      Data.images.map((img, index) => {
        img.index = index
      })
    },

    loadImages: async (imageUrls) => {
      const loadedImages = await Promise.all(imageUrls.map((url) => {
        return new Promise((resolve) => {
          let img = new Image()
          img.onload = () => {
            let params = {}

            params.el       = img
            params.ratio    = img.width / img.height
            params.orient   = params.ratio > 1.2 ? 'l' /* landscape */ : params.ratio < 0.8 ? 'p' /* portrait */ : 'q' /* quadratic */

            if (img.width < options.sizes.minThumbSize) {
              params.width    = options.sizes.minThumbSize
              params.height   = options.sizes.minThumbSize / params.ratio
            }
            else if (img.height < options.sizes.minThumbSize) {
              params.width    = options.sizes.minThumbSize * params.ratio
              params.height   = options.sizes.minThumbSize
            }
            else {
              params.width    = img.width
              params.height   = img.height
              params.ratio    = img.width / img.height
            }

            resolve(params)
          }
          img.src = url
        })
      }))

      Data.images = [ ...Data.images, ...loadedImages ]
    },

    init: async (el, opts, imageUrls) => {
      Data.container = typeof el == 'string' ? document.getElementById(el) : el
      options = merge(options, opts)

      if (options.sizes.containerMaxWidth && Data.container.clientWidth > options.sizes.containerMaxWidth) {
        Data.container.style.width = size(options.sizes.containerMaxWidth)
      } else {
        Data.container.style.width = size(Data.container.clientWidth)
      }

      if (imageUrls) {
        await PhotoMosaic.loadImages(imageUrls)
      }

      PhotoMosaic.setIndexes()
      PhotoMosaic.processThumbs()
      PhotoMosaic.appendThumbs()
    }
  }

  PhotoMosaic.init(el, opts, imageUrls)
}


export default PhotoMosaic
