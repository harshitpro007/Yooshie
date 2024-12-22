import { SERVER } from '@config/environment';
import { Server, createServer } from 'http'
import * as Constant from "@config/constant";
import { redisClient } from "@lib/redis/RedisClient";
import * as utils from '@utils/appUtils'
import { _verifyUserTokenBySocket } from "@plugins/authToken";
import { userDaoV1 } from '@modules/user';
const socketIOPlugin = require('socket.io');
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { chatControllerV1 } from '@modules/chat';
import { ENVIRONMENT } from '@config/constant';
let CONF: any = { db: SERVER.REDIS.DB };
let pubClient: any;
// if (SERVER.ENVIRONMENT === Constant.ENVIRONMENT.PRODUCTION || SERVER.ENVIRONMENT === Constant.ENVIRONMENT.PREPROD) {
//   CONF.tls = {};
//   pubClient = createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF, { disable_resubscribing: true });
// } else {
//   pubClient = createClient({ host: SERVER.REDIS.HOST, port: SERVER.REDIS.PORT });
// }
// const subClient = pubClient.duplicate();
// const adapter = createAdapter(pubClient, subClient);
let io:any;

export class SocketIO {
  public static io: any;//NOSONAR
  private static _instance: SocketIO;
  public static Instance(server?: Server) {
    if (SERVER.ENVIRONMENT === ENVIRONMENT.PRODUCTION || SERVER.ENVIRONMENT === ENVIRONMENT.PREPROD) {
      CONF.tls = {};
      pubClient = createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF, { disable_resubscribing: true });
    } else {
      pubClient = createClient({ host: SERVER.REDIS.HOST, port: SERVER.REDIS.PORT });
    }
    const subClient = pubClient.duplicate();
    const adapter = createAdapter(pubClient, subClient);
    if (this._instance == undefined && server) {
      if (!server)//NOSONAR
        throw Error('Server variable is required');
      const socket = createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('okay');
      }).listen(SERVER.SOCKET_PORT);
      console.log('Socket connected on port:', SERVER.SOCKET_PORT)
      io = socketIOPlugin(socket, { origins: '*:*' });
      io.adapter(adapter);
      this.io = io;
      this.openConnection();
      return this._instance = new this();//NOSONAR
    }
    return this._instance;
  }

  static async openConnection() {
    this.io.on(Constant.SOCKET.LISTNER.DEFAULT.CONNECTION, async (client) => {
      utils.consolelog('socket_connection_id', client.id, true)
      let authorization = client.handshake.query.accessToken;
      let state = client.handshake.query.state;
      utils.consolelog(`${state} value *********authorization token *******`, authorization, true)
      if (authorization) {
        try {
          let response: any = await _verifyUserTokenBySocket({ accessToken: authorization });
          utils.consolelog('*********authorization response *******', response, true)
          if (response.hasOwnProperty('statusCode') && response['statusCode'] === 401) {
            utils.consolelog('*********authorization response hasOwnProperty *******', response, true)
            client.emit(Constant.SOCKET.EMITTER.ERROR.AUTHORIZATION_ERROR, Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR);
            client.disconnect();
            return Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR
          } else {
            response = response.credentials.tokenData;
            let deviceId = response['deviceId'];
            response['id'] = response['userId']
            response['_id'] = response['userId']
            response['userData'] = response
            client.emit(Constant.SOCKET.EMITTER.DEFAULT.CONNECTED, Constant.MESSAGES.SOCKET_SUCCESS.S200.CONNECTION_ESTABLISHED);
            client['userId'] = response['id'];
            client['deviceId'] = deviceId;
            client['userData'] = response;
            client['accessToken'] = authorization
            if (!state) await redisClient.storeValue(SERVER.APP_NAME + "_" + (response['id']).toString() + Constant.REDIS_KEY_PREFIX.SOCKET_ID, client.id);
            if (state) this.informUserStatus(client, false); else this.informUserStatus(client, true);
            this.chatSocketEventsHandler(client)
            this.socketDisconectHandler(this.io, client)
            return {}
          }
        } catch (error) {
          if (error.hasOwnProperty('statusCode') && error['statusCode'] === 401) {
            utils.consolelog('**************error1*************', error, true)
            client.emit(Constant.SOCKET.EMITTER.ERROR.AUTHORIZATION_ERROR, Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR);
            client.disconnect();
            return Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR
          } else {
            utils.consolelog('**************error2*************', error, true)
            client.emit(Constant.SOCKET.EMITTER.ERROR.SOCKET_ERROR, Constant.MESSAGES.SOCKET_ERROR.E400.SOCKET_ERROR)
            client.disconnect();
            return Constant.MESSAGES.SOCKET_ERROR.E400.SOCKET_ERROR
          }
        }
      } else {
        utils.consolelog('**************error3*************', "", true)
        client.emit(Constant.SOCKET.EMITTER.ERROR.AUTHORIZATION_ERROR, Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR);
        client.disconnect();
        return Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR
      }
    })
  }

  static async chatSocketEventsHandler(client: any) {
    /**
      socket services events for one to one chat and group chats for authorized users 
    */
    client.on(Constant.SOCKET.LISTNER.ONE_TO_ONE, async (data: any, ack) => {
      try {
        utils.consolelog('__one_to_one', data, false);
        await chatControllerV1.chatFormation(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    });
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.ONE_TO_ONE_CHAT, async (data: any, ack) => {
      try {
        utils.consolelog('__one_to_one_chat_message', data, false);
        await chatControllerV1.oneToOneMessage(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    // client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.FORWARD, async (data: any, ack) => {
    //   try {
    //     utils.consolelog('__forward_message', data, false);
    //     await chatControllerV1.forwardMessage(this.io, client, data, ack, client['userData']);
    //   } catch (error) {
    //     this.socketErrorHandler(client, error)
    //   }
    // })
    client.on(Constant.SOCKET.LISTNER_TYPE.MESSAGE.REPLIED, async (data: any, ack) => {
      try {
        utils.consolelog('__chat_replied', data, false);
        await chatControllerV1.RepliedToMessage(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.USER.LEFT_ROOM, async (data: any, ack) => {
      try {
        utils.consolelog('__chat_room_left', data, false);
        await chatControllerV1.leftRoom(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.CHAT.LISTING, async (data: any, ack) => {
      try {
        utils.consolelog('__inbox_chat', data, false);
        await chatControllerV1.inboxChat(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.CHAT.MESSAGE, async (data: any, ack) => {
      try {
        utils.consolelog('__inbox_message', data, false);
        await chatControllerV1.inboxMessages(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.MESSAGE.DELETE_MESSAGE, async (data: any, ack) => {
      try {
        utils.consolelog('__delete_message', data, false);
        await chatControllerV1.deleteMessages(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.CHAT.DELETE, async (data: any, ack) => {
      try {
        utils.consolelog('__delete_chat', data, false);
        await chatControllerV1.deleteChat(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.CHAT.TRACKING, async (data: any, ack) => {
      try {
        utils.consolelog('__live_tracking', data, false);
        await chatControllerV1.liveTracking(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
//     client.on(Constant.SOCKET.LISTNER_TYPE.USER.BLOCKED, async (data: any, ack) => {
//       try {
//         utils.consolelog('__user_blocked', data, false);
//         await ChatHandler.chatController.blockedUser(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.CHAT.WALLPAPER, async (data: any, ack) => {
//       try {
//         utils.consolelog('__wallpaper', data, false);
//         await ChatHandler.chatController.setWallpaper(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.BROADCAST.CREATE, async (data: any, ack) => {
//       try {
//         utils.consolelog('__create_broadcast', data, false);
//         await ChatHandler.chatController.createBroadcast(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.BROADCAST.DETAILS, async (data: any, ack) => {
//       try {
//         utils.consolelog('__view_broadcast', data, false);
//         await ChatHandler.chatController.viewBroadCast(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.BROADCAST.EDIT, async (data: any, ack) => {
//       try {
//         utils.consolelog('__edit_broadcast', data, false);
//         await ChatHandler.chatController.editOrDeleteBroadcast(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.BROADCAST.MESSAGES, async (data: any, ack) => {
//       try {
//         utils.consolelog('__send_broadcast', data, false);
//         await ChatHandler.chatController.sendBroadcast(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.BROADCAST.JOIN, async (data: any, ack) => {
//       try {
//         utils.consolelog('__join_broadcast', data, false);
//         await ChatHandler.chatController.joinBroadCast(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
//     client.on(Constant.SOCKET.LISTNER_TYPE.BROADCAST.VIEW_MESSAGE, async (data: any, ack) => {
//       try {
//         utils.consolelog('__inbox_broadcast', data, false);
//         await ChatHandler.chatController.inboxBroadCast(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.CREATE, async (data: any, ack) => {
      try {
        utils.consolelog('__create_group', data, false);
        await chatControllerV1.createGroup(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.EDIT, async (data: any, ack) => {
      try {
        utils.consolelog('__edit_group', data, false);
        await chatControllerV1.editGroup(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.MESSAGES, async (data: any, ack) => {
      try {
        utils.consolelog('__send_group_message', data, false);
        await chatControllerV1.sendGroupMessage(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    // client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.REPLIED, async (data: any, ack) => {
    //   try {
    //     utils.consolelog('__reply_group_message', data, false);
    //     await chatControllerV1.RepliedToGroupMessage(this.io, client, data, ack, client['userData']);
    //   } catch (error) {
    //     this.socketErrorHandler(client, error)
    //   }
    // })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.EXIT, async (data: any, ack) => {
      try {
        utils.consolelog('__exit_group', data, false);
        await chatControllerV1.exitGroup(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.DELETE, async (data: any, ack) => {
      try {
        utils.consolelog('__delete_group', data, false);
        await chatControllerV1.deleteGroup(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.REMOVE, async (data: any, ack) => {
      try {
        utils.consolelog('__remove_group_member', data, false);
        await chatControllerV1.removeGroupMember(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.ADMIN, async (data: any, ack) => {
      try {
        utils.consolelog('__make_group_admin', data, false);
        await chatControllerV1.makeGroupAdmin(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.REMOVE_ADMIN, async (data: any, ack) => {
      try {
        utils.consolelog('__remove_from_admin', data, false);
        await chatControllerV1.removeGroupAdmin(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.GROUP.JOIN, async (data: any, ack) => {
      try {
        utils.consolelog('__join_group_chat', data, false);
        await chatControllerV1.joinGroupChat(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.CHAT.READ_ALL, async (data: any, ack) => {
      try {
        utils.consolelog('__marked_read_all', data, false);
        await chatControllerV1.markedReadAllChat(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
//     client.on(Constant.SOCKET.LISTNER_TYPE.USER.SUBSCRIPTION, async (data: any, ack) => {
//       try {
//         utils.consolelog('__subscription', data, false);
//         await ChatHandler.chatController.checkSubscription(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_INITIATE, async (data: any, ack) => {
      try {
        utils.consolelog('__call_initiate', data, false);
        await chatControllerV1.callInitiate(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_ACCEPT, async (data: any, ack) => {
      try {
        utils.consolelog('__call_accept', data, false);
        await chatControllerV1.callAccept(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_END, async (data: any, ack) => {
      try {
        utils.consolelog('__call_end', data, false);
        await chatControllerV1.callEnd(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.REMOVE_ATTENDEES, async (data: any, ack) => {
      try {
        utils.consolelog('__remove_attendees', data, false);
        await chatControllerV1.removeAttendees(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    });
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CALL_DECLINE, async (data: any, ack) => {
      try {
        utils.consolelog('__call_decline', data, false);
        await chatControllerV1.callDecline(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.USER_CALL_STATUS, async (data: any, ack) => {
      try {
        utils.consolelog('__user_call_status', data, false);
        await chatControllerV1.userCallStatus(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
    client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.CURRENT_CALL_STATUS, async (data: any, ack) => {
      try {
        utils.consolelog('__current_call_status', data, false);
        await chatControllerV1.currentCallStatus(this.io, client, data, ack, client['userData']);
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })
//     client.on(Constant.SOCKET.LISTNER_TYPE.SOCKET_SERVICE.HOME_NOTIFICATION_COUNT, async (data: any, ack) => {
//       try {
//         utils.consolelog('__home_notification_count', data, false);
//         await ChatHandler.chatController.userNotificationCount(this.io, client, data, ack, client['userData']);
//       } catch (error) {
//         this.socketErrorHandler(client, error)
//       }
//     })
    client.on(Constant.SOCKET.LISTNER_TYPE.NOTIFY.DELIVERED, async (data: any, ack) => {
      try {
        utils.consolelog('__delivered', data, false);
        this.informUserStatus(client, false)
      } catch (error) {
        this.socketErrorHandler(client, error)
      }
    })

    return {}
  }

  static async socketErrorHandler(client: any, error: any) {
    utils.consolelog('socketErrorHandler', error, false)
    if (error.type == "INFO_MISSING") {
      client.emit(Constant.SOCKET.EMITTER.ERROR.INSUFFICIENT_INFO, error)
      return {}
    }
    else if (error.type == "INVALID_TOKEN") {
      client.emit(Constant.SOCKET.EMITTER.ERROR.AUTHORIZATION_ERROR, Constant.MESSAGES.SOCKET_ERROR.E401.AUTHORIZATION_ERROR);
      return {}
    }
    else {
      client.emit(Constant.SOCKET.EMITTER.ERROR.NETWORK_ERROR, Constant.MESSAGES.SOCKET_ERROR.E400.NETWORK_ERROR(error))
      return {}
    }
  }

  /**
   * @function socketDisconectHandler 
   * when socket going is to disconnect this function event "disconnect" will listen
   * before disconnect if want to make any update related to user, can be done in "disconnecting" event
   */
  static async socketDisconectHandler(io: any, client: any) {
    try {
      let self = this
      let userId = client['userId'].toString()
      let userData = client['userData'];
      client.on(Constant.SOCKET.LISTNER.DEFAULT.DISCONNECTING, async () => {
        utils.consolelog("socket disconnecting handler", client.rooms, true);
        /*
        sending to rooms in which socket is preset
        let socketRoom= [...(client.rooms)]; 
        socketRoom.forEach((room)=>{
          io.to(`${room}`).emit(Constant.SOCKET.LISTNER_TYPE.USER.USER_STATUS,{
            chatId: room,
            userId:userId,
            isOnline:false,
            lastSeen: Date.now()
          })
        })
        sending to all user where he is not in room but others seeing his status 
        */
        this.informUserStatus(client, false)
        await redisClient.deleteKey(SERVER.APP_NAME + "_" + userId + Constant.REDIS_KEY_PREFIX.SOCKET_ID);
        await chatControllerV1.updateUserLastSeen(userData);
      });
      utils.consolelog("In disconnect handler", userId, true)
      client.on(Constant.SOCKET.LISTNER.DEFAULT.DISCONECT, function () {
        self.socketCheckOnDisconnect(io, client, userId, userData)
        return {}
      });
    } catch (error) {
      utils.consolelog('socketDisconectHandler', error, false)
      return Promise.reject(error)
    }
  }

  /**
   * @function informUserStatus 
   * Inform users for the current user is online/offline on the basis of connect and disconnect
   */
  static async informUserStatus(client: any, isOnline: boolean) {
    try {
      let userId = client['userId'].toString();
      let offline_status = await chatControllerV1.checkUserOfflineOverallStatus(userId, userId);
      if (offline_status) isOnline = false;
      client.broadcast.emit(Constant.SOCKET.LISTNER_TYPE.USER.USER_STATUS, {
        userId: userId,
        isOnline: isOnline,
        lastSeen: Date.now()
      });
      await chatControllerV1.updateDeliveredStatus(client, userId)
    } catch (error) {
      utils.consolelog('informUserStatus', error, false)
      return Promise.reject(error)
    }
  }

  static async socketCheckOnDisconnect(io: any, client: any, userId: string, userData: any) {
    try {
      let self = this
      let socketDisconnectTimer = setTimeout(() => {
        self.onSocketdisconnect(io, client, userId, userData)
      }, SERVER.SOCKET_DISCONNECT_TIMEOUT)

      client.emit(Constant.SOCKET.EMITTER.PING, 'PING', function (ack) {
        utils.consolelog("PING", [userId, ack], true)
        if (ack) {
          clearTimeout(socketDisconnectTimer);
          utils.consolelog('fake disconnect', 'Fake disconnect call', false)
          return {}
        } else {
          return {}
        }
      })
    } catch (error) {
      utils.consolelog('callCheckOnDisconnect', error, false)
      return Promise.reject(error)
    }
  }

  static onSocketdisconnect(io: any, client: any, userId: string, userData: any) {
    if (userId && userData && userData._id) {
      utils.consolelog('onSocketdisconnect', [client['userId'], client.id], true)
    }
    return {}
  }
}
