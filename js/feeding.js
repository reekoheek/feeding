(function() {

    "use strict";

    String.prototype.capitalizeFirstChar = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    var Feeding = window.Feeding = {
        config: {
            // Where Feeding will be attached on your application
            element: "#feeding",
            // Data Provider
            data: {
                appId: {
                    required: true,
                    data: function() {
                        return app.get('app.appId');
                    }
                },
                name: {
                    required: true,
                    data: function() {
                        return $('.feeding-name').val();
                    }
                },
                email: {
                    required: true,
                    data: function() {
                        return $('.feeding-email').val();
                    }
                },
                feedback: {
                    required: true,
                    data: function() {
                        return $('.feeding-feedback').val();
                    }
                }
            },
            // DOM
            // FIXME: There's should be a data binding here :/
            form: {
                name: {
                    tagName: "input",
                    name: "name",
                    type: "name",
                    placeholder: "Type your name",
                    class: "feeding-name form-control",
                    value: function() {
                        app.get('app.user').get('name');
                    }
                },
                email: {
                    tagName: "input",
                    name: "email",
                    type: "email",
                    placeholder: "Type your email address",
                    class: "feeding-email form-control"
                },
                feedback: {
                    tagName: "input",
                    name: "feedback",
                    type: "text",
                    placeholder: "What do you think?",
                    class: "feeding-feedback form-control"
                },
                submit: {
                    tagName: "button",
                    type: "submit",
                    text: "Feed Me",
                    evt: {
                        click: function(evt) {
                            evt.preventDefault();
                            var form = {};
                            _.map(Feeding.config.data, function(value, index) {
                                form[index] = Feeding.config.data[index].data();
                            });
                            feedingModel.set(form);
                            feedingModel.sync();
                        }
                    }
                }
            }
        },
        construct: function(element) {
            element = element || Feeding.config.element;
            if ($(element).length === 0) {
                throw new Error('Cannot find the element to attaching Feeding: ' + element);
            }
            var $body = $('<div class="form-group input-group">');
            _.map(Feeding.config.form, function(value) {
                var a = $('<' + value.tagName + '/>');
                if (value.tagName == "button") { a.text(value.text); a.attr('class', 'btn'); }
                if (value.tagName != "button") {
                    $body.append('<label for="' +
                        value.name.capitalizeFirstChar() +'">' +
                        value.name.capitalizeFirstChar() +
                    '</label>');
                };
                _.map(value, function(val, attr) {
                    if (attr != "tagName" && attr != "evt" && attr != "value") { a.attr(attr, val); }
                    if (attr == "evt") {
                        _.map(value[attr], function(fn, evtType) {
                            a.on(evtType, fn);
                        });
                    }
                });
                $body.append(a);
            });
            return $body.appendTo(element);
        },
        model: Backbone.Model.extend({
            sync: function(callback) {
                var form = feedingModel.attributes;
                for(var i in Feeding.config.data) {
                    if (Feeding.config.data[i].required) {
                        if (form[i] === "" || form[i].length <= 0) {
                            alert(i + " should not be empty");
                            return false;
                        }
                    }
                }
                // FIXME: Main concept, it shouldn't be harcoded :/
                xin.data
                    .post('index.php/feeding/create', form)
                    .done(function(data) {
                        alert("Thanks for submit your feedback.");
                        if (typeof callback === "function") {
                            callback.apply(this, arguments);
                        }
                        console.log(data);
                    }).fail(function() {
                        alert("Something goes wrong. Sorry.");
                    });
            }
        })
    };
})();
