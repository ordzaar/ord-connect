import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
export default function SadoConnect() {
    var _a = useState(true), isOpen = _a[0], setIsOpen = _a[1];
    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "fixed inset-0 flex items-center justify-center" },
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
