"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { CAL_TYPE, DB_MODEL_REF } from "@config/constant";
import { isObjectId } from "@utils/appUtils";

export class CalenderDao extends BaseDao {
  private calenderModel: any;
  constructor() {
    super();
    this.calenderModel = DB_MODEL_REF.CALENDER;
  }

  /**
   * Retrieves calendar events for a given user
   * @param userId The MongoDB ObjectId of the user
   * @returns {Promise<ICalender[]>} A promise that resolves with an array of calendar objects
   */
  async getCalendarEvents(userId: string) {
    if (!isObjectId(userId)) {
      throw new Error("Invalid userId");
    }

    // // MongoDB aggregation to fetch events and combine them directly
    // const result = await this.aggregate(this.calenderModel, [
    //   {
    //     $match: {
    //       userId: toObjectId(userId),
    //       source: { $in: [CAL_TYPE.GOOGLE, CAL_TYPE.APPLE] },
    //     },
    //   },
    //   {
    //     $project: { events: 1 },
    //   },
    //   {
    //     $unwind: "$events", // Unwind each event if needed to process separately
    //   },
    //   {
    //     $group: {
    //       _id: "$userId",
    //       events: { $push: "$events" }, // Push all events back into a single array
    //     },
    //   },
    // ]);

    const appleEvents = await this.findOne(this.calenderModel, {
      userId,
      source: CAL_TYPE.APPLE,
    });
    const googleEvents = await this.findOne(this.calenderModel, {
      userId,
      source: CAL_TYPE.GOOGLE,
    });

    return { appleEvents, googleEvents };
  }

  async storeEvents({
    userId,
    events,
    source,
  }: {
    userId: string;
    events: any[];
    source: string;
  }) {
    if (!Array.isArray(events)) {
      throw new Error("Events should be an array");
    }

    return await this.findOneAndUpdate(
      this.calenderModel,
      { userId, source },
      { events },
      { upsert: true, new: true }
    );
  }
}

export const calenderDao = new CalenderDao();
