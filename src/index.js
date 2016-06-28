((window) => {

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
    sizes: {
      gutter: 5,
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

  function getMaxInArray(arr) {
  	return Math.max.apply(null, arr)
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

    appendThumbs: () => {
      const wrapper = document.createElement('div')

      wrapper.style.overflow  = 'hidden'
      wrapper.style.margin    = '0 auto'
      wrapper.style.width     = size(Data.wrapperWidth ? Data.wrapperWidth : Data.containerWidth)
      wrapper.style.margin    = `-${ options.sizes.gutter }px 0 0 -${ options.sizes.gutter }px`

      each(Data.thumbs, (thumb) => {
        wrapper.appendChild(PhotoMosaic.thumbElement(thumb))
      })

      Data.container.innerHTML = ''
      Data.container.appendChild(wrapper)
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
      el.innerHTML              = '&times;'

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

      el.appendChild(PhotoMosaic.thumbCloseElement(thumb))
      el.appendChild(PhotoMosaic.thumbImgElement(thumb))

      return el
    },

    processInlineThumbs: (images) => {
      const avgRatio  = getArraySummary(images.map((img) => img.width)) / Data.maxW
      const minH      = getMinInArray(images.map((img) => img.height))

      return images.map((img) => {
        const tW = Math.floor(img.width / avgRatio)
        const tH = minH

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

        if (index == Data.images.length - 1) {
          tH = contH - sumH
        } else {
          tH = Math.floor(img.height / avgRatio)
          sumH += tH
        }

        return PhotoMosaic.compute(img, tW, tH)
      })
    },

    processThumbs: () => {
      Data.maxW          = Data.containerWidth = Data.container.offsetWidth
      Data.maxH          = Data.maxW * 0.666
      Data.wrapperWidth  = 0

      const count   = Data.images.length
      let result    = []
      let orients   = ''

      each(Data.images, (img) => {
        if (count < 5) {
          orients += img.orient
        }
      })


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


      ////   2 - 4   ///////////////////////////////////////////////////////////////////

      else if (count < 5) {
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


        ////   2   ////////////////////////////////////////////////////////////////////

        if (count == 2) {
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
      }


      ////   5+   ////////////////////////////////////////////////////////////////////

      else {
        //const avgH = getAverageInArray(images.map((img) => img.height))

        let lines = []
        let line = []
        let lineWidth = 0

        let i = 0
        while (i < Data.images.length) {
          let img = Data.images[i]

          // sum inline images width
          lineWidth += img.width
          line[line.length] = { ...img }

          // if line width more than container width then
          if (lineWidth > Data.maxW) {
            // get minimal image height in line
            let minH = getMinInArray(line.map((img) => img.height))

            // if minimal image height less than minRow height from options
            if (minH < options.sizes.minThumbSize) {
              minH = options.sizes.minThumbSize
            }

            lineWidth = 0

            each(line, (img) => {
              img.width   = minH * img.ratio
              img.height  = minH

              lineWidth += img.width
            })

            if (lineWidth > Data.maxW || i == Data.images.length - 1) {
              if (line.length > 1) {
                line.splice(-1)
                i--
              }

              lines[lines.length] = line
              line = []
              lineWidth = 0
            }
          }
          else if (i == Data.images.length - 1) {
            lines[lines.length] = line
          }

          i++
        }

        console.log(lines);

        result = lines.reduce((result, curr) => {
          return [ ...result, ...PhotoMosaic.processInlineThumbs(curr) ]
        }, [])
      }

      Data.thumbs = result
    },

    loadImages: async (imageUrls) => {
      const loadedImages = await Promise.all(imageUrls.map((url, index) => {
        return new Promise((resolve) => {
          let img = new Image()
          img.onload = () => {
            let params = {}

            params.el       = img
            params.index    = index
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
      Data.container = document.getElementById(el)
      options = { ...options, ...opts }

      if (imageUrls) {
        await PhotoMosaic.loadImages(imageUrls)
      }

      PhotoMosaic.processThumbs()
      PhotoMosaic.appendThumbs()
    }
  }
  

  window.photomosaic = {
    init: PhotoMosaic.init
  }

})(window)
