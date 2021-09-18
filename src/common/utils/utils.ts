import { Model } from 'mongoose';

export const countRecords = async (
  model: Model<any>,
  matchQuery: object,
  extraFields?: object,
) => {
  const total: object[] = await model
    .aggregate()
    .addFields(extraFields)
    .match(matchQuery)
    .count('total');

  return total.length === 0 ? 0 : total[0]['total'];
};
