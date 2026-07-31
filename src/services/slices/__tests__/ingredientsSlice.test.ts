import reducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const initialState = {
  items: [],
  loading: false,
  error: null
};

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/common/i/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/common/i/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/common/i/bun-02-large.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/common/i/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/common/i/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/common/i/meat-01-large.png'
  }
];

describe('ingredientsSlice reducer', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('обрабатывает fetchIngredients.pending', () => {
    const state = reducer(
      { ...initialState, error: 'старая ошибка' },
      { type: fetchIngredients.pending.type }
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('обрабатывает fetchIngredients.fulfilled', () => {
    const state = reducer(
      { ...initialState, loading: true },
      { type: fetchIngredients.fulfilled.type, payload: mockIngredients }
    );
    expect(state.loading).toBe(false);
    expect(state.items).toEqual(mockIngredients);
  });

  test('обрабатывает fetchIngredients.rejected', () => {
    const state = reducer(
      { ...initialState, loading: true },
      {
        type: fetchIngredients.rejected.type,
        error: { message: 'Ошибка загрузки' }
      }
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки');
  });
});
