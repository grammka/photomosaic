((window) => {

  let container
  let images = []
  let thumbs = []
  let maxW = null
  let maxH = null
  let containerWidth
  let wrapperWidth
  let options = {
    images: [],
    sizes: {
      firstThumbMaxWidth: 0.666,
      firstThumbMaxHeight: 0.666
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
  

  const PhotoMosaic = {
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

    thumbElement: (thumb) => {
      const el = document.createElement('div')

      el.style.overflow   = 'hidden'
      el.style.float      = 'left'
      el.style.width      = size(thumb.width)
      el.style.height     = size(thumb.height)

      el.appendChild(PhotoMosaic.thumbImgElement(thumb))

      return el
    },

    appendThumbs: () => {
      const wrapper = document.createElement('div')

      wrapper.style.overflow  = 'hidden'
      wrapper.style.width     = size(wrapperWidth)

      each(thumbs, (thumb) => {
        wrapper.appendChild(PhotoMosaic.thumbElement(thumb))
      })

      container.appendChild(wrapper)
    },

    compute: (img, w, h) => {
      return {
        img,
        width: w,
        height: h,
        ratio: w / h
      }
    },

    processInlineThumbs: (images) => {
      const avgRatio  = getArraySummary(images.map((img) => img.width)) / maxW
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

      if (minW < 100) {
        minW = 100
      }

      if (minW > maxW - contW) {
        minW = maxW - contW
      }

      wrapperWidth += minW

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
      maxW          = containerWidth = container.offsetWidth
      maxH          = maxW * 0.666
      wrapperWidth  = 0

      const count = images.length
      let result  = []
      let orients = ''


      each(images, (img) => {
        if (count < 5) {
          orients += img.orient
        }
      })


      ////   1   ////////////////////////////////////////////////////////////////////////

      if (count == 1) {
        let tW, tH

        if (images[0].width > maxW) {
          tW = maxW
          tH =  Math.floor(tW / images[0].ratio)
        } else {
          tW = images[0].width
          tH = images[0].height > maxH ? maxH : images[0].height
        }
  
        result[0] = PhotoMosaic.compute(images[0], tW, tH)
      }


      ////   2 - 4   ///////////////////////////////////////////////////////////////////

      else if (count < 5) {
        let commonOrient

        if (images[0].width > maxW) {
          const tW = maxW
          const tH = maxH * options.firstThumbMaxHeight
          result[0] = PhotoMosaic.compute(images[0], tW, tH)

          commonOrient = 'l' /* landscape */
        }
        else {
          const tW = maxW * options.firstThumbMaxWidth
          const tH = maxH
          result[0] = PhotoMosaic.compute(images[0], tW, tH)

          commonOrient = 'p' /* portrait */
        }


        ////   2   ////////////////////////////////////////////////////////////////////

        if (count == 2) {
          if (orients == 'll') {
            // TODO check if Images width is more than Container's

            result[0] = PhotoMosaic.compute(images[0], maxW,  Math.floor(maxW / images[0].ratio))
            result[1] = PhotoMosaic.compute(images[1], maxW,  Math.floor(maxW / images[1].ratio))
          }
          else {
            result = PhotoMosaic.processInlineThumbs(images)
          }
        }


        ////   3   ///////////////////////////////////////////////////////////////////

        else if (count == 3) {
          if (commonOrient == 'l') {
            const tW = maxW
            const tH = Math.floor(maxW / images[0].ratio)

            result[0] = PhotoMosaic.compute(images[0], tW, tH)
            result = [ ...result, ...PhotoMosaic.processInlineThumbs(images.slice(1)) ]
          }
          else if (commonOrient == 'p') {
            let tW = maxW * options.sizes.firstThumbMaxWidth
            let tH = Math.floor(tW / images[0].ratio)

            if (tH > maxH) {
              tH = maxH
              tW = maxH * images[0].ratio
            }

            wrapperWidth += tW

            result[0] = PhotoMosaic.compute(images[0], tW, tH)
            result = [ ...result, ...PhotoMosaic.processColumnThumbs(images.slice(1), tW, tH) ]
          }
        }


        ////   4   ///////////////////////////////////////////////////////////////////

        else if (count == 4) {

        }
      }


      ////   5+   ////////////////////////////////////////////////////////////////////

      else {

      }

      thumbs = result
    },

    loadImages: async (imageUrls) => {
      const loadedImages = await Promise.all(imageUrls.map((url) => {
        return new Promise((resolve) => {
          let img = new Image()
          img.onload = () => {
            let params = {}

            params.el       = img
            params.width    = img.width
            params.height   = img.height
            params.ratio    = img.width / img.height
            params.orient   = params.ratio > 1.2 ? 'l' /* landscape */ : params.ratio < 0.8 ? 'p' /* portrait */ : 'q' /* quadratic */

            resolve(params)
          }
          img.src = url
        })
      }))

      images = [ ...images, ...loadedImages ]
    },

    init: async (el, opts, imageUrls) => {
      container = document.getElementById(el)
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
