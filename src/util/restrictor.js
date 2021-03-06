"use strict";

goog.provide("Entry.Restrictor");

goog.require("Entry.Utils");

Entry.Restrictor = function(controller) {
    this._controller = controller;
    this.startEvent = new Entry.Event(this);
    this.endEvent = new Entry.Event(this);

    this.currentTooltip = null;
};

(function(p) {
    p.restrict = function(data, toolTipRender) {
        this._data = data;
        this.toolTipRender = toolTipRender;

        this.end();

        var log = data.content.concat();
        var commandType = log.shift();
        var command = Entry.Command[commandType];


        var domQuery = command.dom;
        this.startEvent.notify();
        if (domQuery instanceof Array)
            domQuery = this.processDomQuery(domQuery);

        if (!data.tooltip)
            data.tooltip = {
                title: "액션",
                content: "지시 사항을 따르시오"
            };

        if (command.restrict) {
            this.currentTooltip = command.restrict(
                data, domQuery, this.restrictEnd.bind(this), this);
            return;
        } else {
            this.currentTooltip = new Entry.Tooltip([{
                title: data.tooltip.title,
                content: data.tooltip.content,
                target: domQuery
            }], {
                restrict: true,
                dimmed: true,
                callBack: this.restrictEnd.bind(this)
            });
            window.setTimeout(this.align.bind(this));
        }

        if (data.skip) {
            return this.end();
        }

    };

    p.end = function() {
        if (this.currentTooltip) {
            this.currentTooltip.dispose();
            this.currentTooltip = null;
        }
    };

    p.restrictEnd = function() {
        this.endEvent.notify();
    };

    p.align = function() {
        if (this.currentTooltip)
            this.currentTooltip.alignTooltips();
    };

    p.processDomQuery = function(domQuery, log) {
        log = log || this._data.content;
        log = log.concat();
        log.shift();
        if (domQuery instanceof Array) {
            domQuery = domQuery.map(function(q) {
                if (q[0] === "&")
                    return log[Number(q.substr(1))][1];
                else
                    return q;
            });
        }
        return domQuery;
    };

    p.renderTooltip = function() {
        if (this.currentTooltip)
            this.currentTooltip.render();
    }

    p.fadeOutTooltip = function() {
        if (this.currentTooltip)
            this.currentTooltip.fadeOut();
    };

    p.fadeInTooltip = function() {
        if (this.currentTooltip)
            this.currentTooltip.fadeIn();
    };

    p.isTooltipFaded = function() {
        if (this.currentTooltip)
            return this.currentTooltip.isFaded();
        return false;
    };

    p.requestNextData = function() {
        if (this._controller) {
            return this._controller.requestNextData();
        }
    };
})(Entry.Restrictor.prototype);
