import hpp from 'hpp';

const hppMiddleware = hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price',
  ],
});

export default hppMiddleware;
