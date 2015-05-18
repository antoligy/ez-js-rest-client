/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(function (require) {

    // Declaring dependencies
    var MicrosoftXmlHttpRequestConnection = require("connections/MicrosoftXmlHttpRequestConnection"),
        Response = require("structures/Response"),
        CAPIError = require("structures/CAPIError");

    describe("Microsoft XmlHttpRequest Connection", function () {

        var connection,
            mockCallback,
            mockXMLHttpRequest,
            mockRequest,
            HeadersObject,
            testLogin = "login",
            testPassword = "password",
            testErrorCode = 400;

        HeadersObject = function () {
            this.testHeader = "testHeaderValue";
        };
        HeadersObject.prototype.dummyProperty = "prototype dummy property";

        mockRequest = {
            body: {testBody: ""},
            headers: new HeadersObject(),
            httpBasicAuth: false,
            method: "GET",
            url: "/"
        };


        beforeEach(function (){

            mockCallback = jasmine.createSpy('mockCallback');

            mockXMLHttpRequest = function (){};
            mockXMLHttpRequest.prototype.open = function(method, url, async, user, password){};
            mockXMLHttpRequest.prototype.setRequestHeader = function(headerType, header){};
            mockXMLHttpRequest.prototype.getAllResponseHeaders = function (){};

            spyOn(mockXMLHttpRequest.prototype, 'open').andCallThrough();
            spyOn(mockXMLHttpRequest.prototype, 'setRequestHeader').andCallThrough();
            spyOn(mockXMLHttpRequest.prototype, 'getAllResponseHeaders').andCallThrough();
        });

        it("is checking compatibility correctly when window.ActiveXObject is present", function (){

            window.ActiveXObject = {};

            expect(MicrosoftXmlHttpRequestConnection.isCompatible()).toEqual(true);

        });

        it("is checking compatibility correctly when window.ActiveXObject is absent", function (){

            window.ActiveXObject = null;

            expect(MicrosoftXmlHttpRequestConnection.isCompatible()).toEqual(false);

        });

        describe("is correctly using XmlHttpRequest while performing:", function (){

            beforeEach(function (){

                mockXMLHttpRequest.prototype.send = function(body){
                    this.readyState = 4;
                    this.status = 200;
                    this.onreadystatechange();
                };
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.ActiveXObject = (function (what) {
                    return mockXMLHttpRequest;
                }());

                connection = new MicrosoftXmlHttpRequestConnection();
            });

            it("execute call", function (){

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // errors

            });

            it("execute call with BasicHttp Authorization", function (){

                mockRequest.httpBasicAuth = true;
                mockRequest.login = testLogin;
                mockRequest.password = testPassword;

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[3]).toEqual(testLogin); //login
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[4]).toEqual(testPassword); //password

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // errors
            });

        });

        describe("is returning errors and retrying correctly, when ", function (){

            it("request is not finished yet", function (){

                mockXMLHttpRequest.prototype.send = function(body){
                    this.readyState = 3;
                    this.status = 0;
                    this.onreadystatechange();
                    this.readyState = 4;
                    this.status = 200;
                    this.onreadystatechange();
                };
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.ActiveXObject = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new MicrosoftXmlHttpRequestConnection();

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[3]).toEqual(testLogin); //login
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[4]).toEqual(testPassword); //password

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // response
            });

            it("request have failed", function (){

                mockXMLHttpRequest.prototype.send = function(body){
                    this.readyState = 4;
                    this.status = testErrorCode;
                    this.onreadystatechange();
                };
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.ActiveXObject = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new MicrosoftXmlHttpRequestConnection();

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError), jasmine.any(Response)
                );
            });

            it("should provide the request in the error object", function () {
                mockXMLHttpRequest.prototype.send = function (body) {
                    this.readyState = 4;
                    this.status = testErrorCode;
                    this.onreadystatechange();
                };
                window.ActiveXObject = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new MicrosoftXmlHttpRequestConnection();
                connection.execute(mockRequest, function (error, response) {
                    expect(error.details.request).toEqual(mockRequest);
                });
            });

            it("should handle the fail to connect error", function () {
                mockXMLHttpRequest.prototype.send = function (body){
                    this.readyState = 4;
                    this.status = 0;
                    this.onreadystatechange();
                };
                window.ActiveXObject = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new MicrosoftXmlHttpRequestConnection();
                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError), jasmine.any(Response)
                );
            });
        });
    });
});
