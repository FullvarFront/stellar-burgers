import { test, expect, Page } from '@playwright/test';

const BUN_ID = '643d69a5c3f7b9001cfa093c';
const MAIN_ID = '643d69a5c3f7b9001cfa0941';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';

const ORDER_NUMBER = 55555;

const mockUser = {
  success: true,
  user: { email: 'test@stellar.ru', name: 'Космонавт' }
};

const mockOrder = {
  success: true,
  name: 'Космический бургер',
  order: {
    _id: '660d4fa197ede0001d06bfff',
    status: 'done',
    name: 'Космический бургер',
    createdAt: '2024-04-03T12:00:00.000Z',
    updatedAt: '2024-04-03T12:00:01.000Z',
    number: ORDER_NUMBER,
    ingredients: [BUN_ID, MAIN_ID, BUN_ID],
    price: 2934
  }
};

// Добавляет ингредиент из каталога в конструктор по его id.
const addToConstructor = async (page: Page, id: string) => {
  await page
    .getByTestId(`ingredient-${id}`)
    .getByRole('button', { name: 'Добавить' })
    .click();
};

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Перехватываем запрос ингредиентов и отдаём моки из HAR-файла.
    await page.routeFromHAR('./tests/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });
    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
  });

  test('добавление булки и начинки в конструктор', async ({ page }) => {
    await addToConstructor(page, BUN_ID);
    await addToConstructor(page, MAIN_ID);

    const constructor = page.getByTestId('burger-constructor');
    await expect(constructor.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
    await expect(constructor.getByText(MAIN_NAME)).toBeVisible();
  });

  test('модальное окно ингредиента: открытие и закрытие', async ({ page }) => {
    // Открытие по клику на карточку ингредиента.
    await page.getByTestId(`ingredient-${BUN_ID}`).locator('a').click();
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    // Закрытие по клику на крестик.
    await page.getByTestId('modal-close').click();
    await expect(modal).not.toBeVisible();

    // Повторное открытие и закрытие по клику на оверлей.
    await page.getByTestId(`ingredient-${BUN_ID}`).locator('a').click();
    await expect(modal).toBeVisible();
    await page.getByTestId('modal-overlay').click({ position: { x: 5, y: 5 } });
    await expect(modal).not.toBeVisible();
  });

  test('создание заказа авторизованным пользователем', async ({
    page,
    context
  }) => {
    // Подставляем моковые токены авторизации.
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.addInitScript(() =>
      window.localStorage.setItem('refreshToken', 'test-refresh-token')
    );

    // Моки ответов на запрос данных пользователя и создание заказа.
    await page.route('**/api/auth/user', (route) =>
      route.fulfill({ json: mockUser })
    );
    await page.route('**/api/orders', (route) =>
      route.fulfill({ json: mockOrder })
    );

    // Перезагружаем страницу, чтобы приложение подхватило авторизацию.
    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();

    // Собираем бургер.
    await addToConstructor(page, BUN_ID);
    await addToConstructor(page, MAIN_ID);

    // Оформляем заказ.
    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    // Модальное окно открылось и номер заказа верный.
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(String(ORDER_NUMBER))).toBeVisible();

    // Конструктор пуст.
    const constructor = page.getByTestId('burger-constructor');
    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    // Закрываем модальное окно.
    await page.getByTestId('modal-close').click();
    await expect(modal).not.toBeVisible();
  });
});
