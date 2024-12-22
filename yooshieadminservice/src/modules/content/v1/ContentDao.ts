"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";

import { CONTENT_TYPE, DB_MODEL_REF, STATUS } from "@config/constant";
import { escapeSpecialCharacter } from "@utils/appUtils";
import { Search } from "@modules/admin/searchMapper";

export class ContentDao extends BaseDao {
  private modelContent: any;
  constructor() {
    super();
    this.modelContent = DB_MODEL_REF.CONTENT;
  }

  /**
   * @function isFaqExist
   */
  async isFaqExist(params) {
    try {
      const query: any = {};
      query.question = params.question;
      query.status = { $ne: STATUS.DELETED };
      query.type = CONTENT_TYPE.FAQ;
      if (params.faqId) query._id = { $not: { $eq: params.faqId } };
      const projection = { _id: 1 };

      return await this.findOne(this.modelContent, query, projection);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function deleteContent
   */
  async deleteContent(params: ContentRequest.Id) {
    try {
      const query: any = {};
      query._id = params.contentId;

      const update = {};
      update["$set"] = {
        status: STATUS.DELETED,
      };

      return await this.updateOne(this.modelContent, query, update, {});
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function contentDetails
   */
  async contentDetails(params: ContentRequest.Type) {
    try {
      const query: any = {};
      query.type = params.type;

      const update: any = {};
      const projection = {
        _id: 1,
        data: 1,
        type: 1,
        created: 1,
        imageAndContent: 1,
      };
      const response = await this.findOne(this.modelContent, query, projection);
      if (params.theme === "DARK") {
        response.data = `<body style="color: white; background-color:#FF080808 !important">${response.data}</body>`;
        return response;
      }
      return response;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editContent
   */
  async editContent(params: ContentRequest.Edit) {
    try {
      const query: any = {};
      query.type = params.type;

      const update = {};
      update["$set"] = {
        data: params?.data,
        imageAndContent: params?.imageAndContent,
      };
      // Create If not exist.
      const options = { upsert: true, new: true };
      return await this.updateMany(this.modelContent, query, update, options);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function addFaq
   */
  async addFaq(params: ContentRequest.AddFaq) {
    try {
      params.type = CONTENT_TYPE.FAQ;
      return await this.save(this.modelContent, params);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function faqList
   */
  async faqList(params: ListingRequest) {
    try {
      const aggPipe = [];

      const match: any = {};
      match.type = CONTENT_TYPE.FAQ;

      if (params?.status) match.status = params.status;

      if (params.searchKey) {
        params.searchKey = escapeSpecialCharacter(params.searchKey);
        aggPipe.push(Search(params.searchKey, ["question"]));
      }
      aggPipe.push({ $match: match });
      let sort = {};

      params.sortBy && params.sortOrder
        ? (sort = { [params.sortBy]: params.sortOrder })
        : (sort = { created: -1 });
      aggPipe.push({ $sort: sort });

      if (params.limit && params.pageNo) {
        const [skipStage, limitStage] = this.addSkipLimit(
          params.limit,
          params.pageNo
        );
        aggPipe.push(skipStage, limitStage);
      }

      let project: any = {};
      if (params.theme === "DARK") {
        project = {
          id: 1,
          question: {
            $concat: [
              "<body style='color: white; background-color:#FF080808 !important'>",
              "$question",
              "</body>",
            ],
          },
          answer: {
            $concat: [
              "<body style='color: white; background-color:#FF080808 !important'>",
              "$answer",
              "</body>",
            ],
          },
          created: 1,
          position: 1,
          status: 1,
        };
      } else {
        project = {
          id: 1,
          question: 1,
          answer: 1,
          created: 1,
          position: 1,
          status: 1,
        };
      }
      aggPipe.push({ $project: project });

      aggPipe.push({ $sort: { position: 1 } });

      const response = await this.dataPaginate(
        this.modelContent,
        aggPipe,
        params.limit,
        params.pageNo,
        {},
        true
      );
      return response;
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function editFaq
   */
  async editFaq(params: ContentRequest.EditFaq) {
    try {
      const query: any = {};
      query._id = params.faqId;

      const update = {};
      update["$set"] = {
        answer: params.answer,
        question: params.question,
        status: params.status,
      };
      if (params.position) update["$set"]["position"] = params.position;

      return await this.updateOne(this.modelContent, query, update, {});
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function deleteFaq
   */
  async deleteFaq(params: ContentRequest.FaqId) {
    try {
      const query: any = {};
      query._id = params.faqId;

      return await this.deleteOne(this.modelContent, query);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function faqDetails
   */
  async faqDetails(params: ContentRequest.FaqId) {
    try {
      const query: any = {};
      query._id = params.faqId;

      const projection = {
        _id: 1,
        question: 1,
        answer: 1,
        type: 1,
        created: 1,
        position: 1,
      };

      return await this.findOne(this.modelContent, query, projection);
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }

  /**
   * @function viewContent
   */
  async viewContent(params: ContentRequest.View) {
    try {
      const aggPipe = [];
      const match: any = {};
      match.type = params.type;
      aggPipe.push({ $match: match });

      let project = {};
      if (params.type === CONTENT_TYPE.FAQ) {
        project = { _id: 1, question: 1, answer: 1, position: 1 };
        aggPipe.push({ $sort: { position: 1 } });
      } else project = { _id: 1, data: 1, imageAndContent: 1, created: 1 };
      aggPipe.push({ $project: project });

      return await this.aggregate(this.modelContent, aggPipe, {});
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }
}

export const contentDao = new ContentDao();
