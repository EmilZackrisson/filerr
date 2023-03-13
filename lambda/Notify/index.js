"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var cross_fetch_1 = require("cross-fetch");
var sdk = require("node-appwrite");
var client = new sdk.Client();
var users = new sdk.Users(client);
// Init Appwrite SDK
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(process.env.APPWRITE_PROJECT) // Your project ID
    .setKey(process.env.APPWRITE_KEY); // Your secret API key
// Handler
exports.handler = function (event, context, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var body, _a, _b, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
                    console.log('## CONTEXT: ' + serialize(context));
                    console.log('## EVENT: ' + serialize(event));
                    console.log(event);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    body = event;
                    if (!checkSession(body.userId, body.sessionId)) return [3 /*break*/, 5];
                    if (!(body.eventType === 'newRequest')) return [3 /*break*/, 3];
                    console.log('New request event received');
                    _a = callback;
                    _b = formatResponse;
                    return [4 /*yield*/, notifyNew(body)];
                case 2:
                    _a.apply(void 0, [_b.apply(void 0, [_c.sent()])]);
                    return [3 /*break*/, 4];
                case 3:
                    console.log('Unknown event type received');
                    callback(formatError({ statusCode: 400, code: 'Bad Request', message: 'Unknown event type' }));
                    _c.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    console.log('Invalid session from user: ', body.requestData.user);
                    callback(formatError({ statusCode: 401, code: 'Unauthorized', message: 'Invalid session' }));
                    _c.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _c.sent();
                    console.error('Error while handling event: ', error_1);
                    callback(formatError({ statusCode: 500, code: 'Internal Server Error', message: error_1 }));
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
};
var formatResponse = function (body) {
    console.log('Response: ', body);
    var response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        // multiValueHeaders: {
        // 	'X-Custom-Header': ['My value', 'My other value']
        // },
        body: body
    };
    return response;
};
var formatError = function (error) {
    console.log('Error: ', error);
    var response = {
        statusCode: error.statusCode,
        headers: {
            'Content-Type': 'text/plain',
            'x-amzn-ErrorType': error.code
        },
        isBase64Encoded: false,
        body: error.code + ': ' + error.message
    };
    return response;
};
var serialize = function (object) {
    return JSON.stringify(object, null, 2);
};
function notifyNew(event) {
    return __awaiter(this, void 0, void 0, function () {
        var eventBody;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    eventBody = event;
                    return [4 /*yield*/, sendDiscord(eventBody.requestData.user, eventBody.requestData.filename, eventBody.requestData.text, eventBody.requestData.type)
                            .then(function () {
                            return formatResponse('OK');
                        })["catch"](function () {
                            return formatError({
                                statusCode: 500,
                                code: 'Internal Server Error',
                                message: 'Error while sending new request to Discord'
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sendDiscord(user, filename, text, type) {
    return __awaiter(this, void 0, void 0, function () {
        var params, WEBHOOK_URL, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        username: 'Filerr',
                        embeds: [
                            {
                                title: 'Ny förfrågan',
                                color: 15258703,
                                url: 'https://filerr.emilzackrisson.se',
                                author: {
                                    name: user
                                },
                                description: "".concat(user, " f\u00F6rfr\u00E5gade om filen ").concat(filename, "."),
                                fields: [
                                    {
                                        name: 'Typ',
                                        value: type,
                                        inline: true
                                    },
                                    {
                                        name: 'Text',
                                        value: text,
                                        inline: false
                                    }
                                ]
                            }
                        ]
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
                    console.log('Sending new request to Discord: ', params);
                    console.log('Webhook URL: ', WEBHOOK_URL);
                    return [4 /*yield*/, (0, cross_fetch_1["default"])(WEBHOOK_URL, {
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify(params)
                        }).then(function (res) {
                            console.log('Discord webhook response: ', serialize(res));
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error while sending new request to Discord: ', error_2);
                    return [2 /*return*/, formatError(error_2)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function checkSession(userId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var userSessions, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, users.listSessions(userId)];
                case 1:
                    userSessions = _a.sent();
                    session = userSessions.sessions.find(function (session) { return session.$id === sessionId; });
                    if (session) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
