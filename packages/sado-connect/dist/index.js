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
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
export default function SadoConnect() {
    var _a = useState(""), text = _a[0], setText = _a[1];
    useEffect(function () {
        var scriptUrls = [
            "ecc.js",
            "bip32.js",
            "bip39.js",
            "buffer.js",
            "bitcoin-tap.js",
            "ordit-sdk.js",
        ];
        var scripts = [];
        scriptUrls.forEach(function (url) {
            var script = document.createElement("script");
            script.src = "ordit/".concat(url);
            script.async = true;
            document.body.appendChild(script);
            scripts.push(script);
        });
        return function () {
            scripts.forEach(function (script) {
                document.body.removeChild(script);
            });
        };
    }, []);
    var _b = useState(true), isOpen = _b[0], setIsOpen = _b[1];
    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, window.ordit.sdk.get("wallet", {
                            seed: "msmalley",
                        })];
                    case 1:
                        wallet = _a.sent();
                        console.log(wallet);
                        setText(JSON.stringify(wallet.addresses));
                        return [2 /*return*/];
                }
            });
        });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "fixed inset-0 flex items-center justify-center" },
            text,
            React.createElement("button", { type: "button", onClick: openModal, className: "rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75" }, "Connect wallet")),
        React.createElement(Transition, { appear: true, show: isOpen, as: Fragment },
            React.createElement(Dialog, { as: "div", className: "relative z-10", onClose: closeModal },
                React.createElement(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" },
                    React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-25" })),
                React.createElement("div", { className: "fixed inset-0 overflow-y-auto" },
                    React.createElement("div", { className: "flex min-h-full items-center justify-center p-4 text-center" },
                        React.createElement(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95" },
                            React.createElement(Dialog.Panel, { className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all" },
                                React.createElement(Dialog.Title, { as: "h3", className: "text-lg font-medium leading-6 text-gray-900" }, "Choose wallet to connect"),
                                React.createElement("div", { className: "mt-4" },
                                    React.createElement("button", { type: "button", className: "inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2", onClick: closeModal }, "Unisat wallet"),
                                    React.createElement("button", { type: "button", className: "inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2", onClick: closeModal }, "Xverse"))))))))));
}
