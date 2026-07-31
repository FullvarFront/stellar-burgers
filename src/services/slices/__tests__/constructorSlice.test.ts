import reducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructorSlice';
import { TConstructorIngredient, TIngredient } from '@utils-types';

const initialState = {
  bun: null,
  ingredients: []
};

const bun: TIngredient = {
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
};

const filling: TIngredient = {
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
};

// Хелпер: собирает начинку с заранее известным id, чтобы проверять удаление и перемещение.
const withId = (
  ingredient: TIngredient,
  id: string
): TConstructorIngredient => ({ ...ingredient, id });

describe('constructorSlice reducer', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('addIngredient c булкой кладёт её в bun и добавляет id', () => {
    const state = reducer(initialState, addIngredient(bun));
    expect(state.bun).toMatchObject({ _id: bun._id, name: bun.name });
    expect(state.bun?.id).toEqual(expect.any(String));
    expect(state.ingredients).toHaveLength(0);
  });

  test('addIngredient c начинкой добавляет её в массив с id', () => {
    const state = reducer(initialState, addIngredient(filling));
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject({ _id: filling._id });
    expect(state.ingredients[0].id).toEqual(expect.any(String));
    expect(state.bun).toBeNull();
  });

  test('removeIngredient удаляет начинку по id', () => {
    const stateWithItems = {
      bun: null,
      ingredients: [withId(filling, 'id-1'), withId(filling, 'id-2')]
    };
    const state = reducer(stateWithItems, removeIngredient('id-1'));
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].id).toBe('id-2');
  });

  test('moveIngredient меняет порядок начинок', () => {
    const stateWithItems = {
      bun: null,
      ingredients: [withId(filling, 'id-1'), withId(filling, 'id-2')]
    };
    const state = reducer(stateWithItems, moveIngredient({ from: 0, to: 1 }));
    expect(state.ingredients[0].id).toBe('id-2');
    expect(state.ingredients[1].id).toBe('id-1');
  });

  test('clearConstructor сбрасывает конструктор', () => {
    const stateWithItems = {
      bun: withId(bun, 'bun-id'),
      ingredients: [withId(filling, 'id-1')]
    };
    expect(reducer(stateWithItems, clearConstructor())).toEqual(initialState);
  });
});
