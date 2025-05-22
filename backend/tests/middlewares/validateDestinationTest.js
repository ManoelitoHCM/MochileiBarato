// tests/middlewares/validateDestination.test.js
const validateDestination = require('../../src/middlewares/validateDestination');

const mockRequest = (body) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('Middleware validateDestination', () => {
  it('deve permitir requisição válida', () => {
    const req = mockRequest({ origin: 'GRU', month: '2025-12', budget: 1000 });
    const res = mockResponse();
    const next = jest.fn();

    validateDestination[validateDestination.length - 1](req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('deve bloquear requisição inválida', () => {
    const req = mockRequest({ origin: '', month: '', budget: -10 });
    const res = mockResponse();
    const next = jest.fn();

    validateDestination[validateDestination.length - 1](req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });
});
