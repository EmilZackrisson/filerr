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
// import { Models } from 'appwrite';
var node_appwrite_1 = require("node-appwrite");
var nodemailer = require('nodemailer');
/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/
module.exports = function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var client, users, updatedDocument, user, userEmail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Request: ', req);
                    client = new node_appwrite_1.Client();
                    users = new node_appwrite_1.Users(client);
                    if (JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA']).status !== 'Begun') {
                        res.send('Admin har inte påbörjat');
                        return [2 /*return*/];
                    }
                    if (!req.variables['APPWRITE_FUNCTION_ENDPOINT'] || !req.variables['APPWRITE_FUNCTION_API_KEY']) {
                        console.warn('Environment variables are not set. Function cannot use Appwrite SDK.');
                    }
                    else {
                        client
                            .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
                            .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
                            .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);
                    }
                    if (!(req.variables['APPWRITE_FUNCTION_EVENT_DATA'] !== null ||
                        req.variables['APPWRITE_FUNCTION_EVENT_DATA'] !== undefined ||
                        req.variables['APPWRITE_FUNCTION_EVENT_DATA'].completedBy !== '')) return [3 /*break*/, 2];
                    if (!(req.variables['SMTP_USER'] !== null || req.variables['SMTP_USER'] !== undefined)) return [3 /*break*/, 2];
                    updatedDocument = JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA']);
                    console.log('Completed Document: ', updatedDocument);
                    return [4 /*yield*/, users.get(updatedDocument.user)];
                case 1:
                    user = _a.sent();
                    userEmail = user.email;
                    sendUserEmail(updatedDocument, users, req.variables['SMTP_HOST'], req.variables['SMTP_EMAIL'], req.variables['SMTP_USER'], req.variables['SMTP_PASS']);
                    res.send(updatedDocument.completedBy + ' förfrågade ' + updatedDocument.name);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
};
function sendUserEmail(request, users, smtp_host, smtp_email, smtp_user, smtp_pass) {
    return __awaiter(this, void 0, void 0, function () {
        var transporter, htmlMessage, info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = nodemailer.createTransport({
                        host: smtp_host,
                        port: 587,
                        secure: false,
                        auth: {
                            user: smtp_user,
                            pass: smtp_pass // generated ethereal password
                        }
                    });
                    htmlMessage = '<p>Någon har påbörjat din förfrågan på ' + request.name + '.</p>';
                    return [4 /*yield*/, transporter.sendMail({
                            from: 'Filerr' + ' <' + smtp_email + '>',
                            to: getUserEmail(request, users),
                            subject: request.name,
                            text: 'Någon har påbörjat din förfrågan på ' + request.name,
                            html: htmlMessage // html body
                        })];
                case 1:
                    info = _a.sent();
                    console.log('Message sent: %s', request);
                    return [2 /*return*/];
            }
        });
    });
}
function getUserEmail(request, users) {
    return __awaiter(this, void 0, void 0, function () {
        var user, userEmail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, users.get(request.user)];
                case 1:
                    user = _a.sent();
                    userEmail = user.email;
                    return [2 /*return*/, userEmail];
            }
        });
    });
}
