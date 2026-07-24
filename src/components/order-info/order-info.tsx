import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import {
  fetchOrderByNumber,
  selectIngredients,
  selectFeedOrders,
  selectUserOrders,
  selectViewedOrder
} from '@slices';

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const orderNumber = Number(number);
  const dispatch = useDispatch();

  const ingredients = useSelector(selectIngredients);
  const feedOrders = useSelector(selectFeedOrders);
  const userOrders = useSelector(selectUserOrders);
  const viewedOrder = useSelector(selectViewedOrder);

  // Заказ может уже лежать в ленте или в истории — тогда лишний запрос не нужен.
  const orderData =
    feedOrders.find((item) => item.number === orderNumber) ||
    userOrders.find((item) => item.number === orderNumber) ||
    viewedOrder;

  useEffect(() => {
    if (!orderData) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderNumber, orderData]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
