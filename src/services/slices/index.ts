import { combineReducers } from '@reduxjs/toolkit';

import ingredients from './ingredientsSlice';
import burgerConstructor from './constructorSlice';
import feed from './feedSlice';
import order from './orderSlice';
import userOrders from './userOrdersSlice';
import user from './userSlice';

export const rootReducer = combineReducers({
  ingredients,
  burgerConstructor,
  feed,
  order,
  userOrders,
  user
});

export * from './ingredientsSlice';
export * from './constructorSlice';
export * from './feedSlice';
export * from './orderSlice';
export * from './userOrdersSlice';
export * from './userSlice';
