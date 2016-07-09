var PhotoMosaic = require('./photomosaic').default;

new PhotoMosaic('photomosaic', {
  editable: false
}, [
  'photos/2.jpg',
  'photos/1.jpg',
  'photos/3.jpg',
  'photos/4.jpg',
  'photos/5.jpg',
  'photos/6.jpg',
  'photos/3.jpg',
  'photos/2.jpg'
]);
