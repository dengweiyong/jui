/*
常用函数guid getQueryParam format DateDemo replaceAll 操作
*/
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

//变量为null or undefined 返回 ''
function isNull(fieldvalue) {
    return fieldvalue == undefined || fieldvalue == null ? '' : fieldvalue;
};

function isEmpty(value) {
    return value === "" || value === null || value === undefined || ($.isArray(value) && value.length === 0) || $.isEmptyObject(value)
};

//取URL参数值 
getUrlParam = getQueryParam = function (key) {
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
};

///获取当前日期yyyy-mm-dd字符串
function DateDemo() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
};

// helper fn for console logging
function log() {
    return;
    //var msg = Array.prototype.join.call(arguments,'');
    if (window.console && window.console.log) {
        window.console.log(arguments);
    }
    else if (window.opera && window.opera.postError) {
        window.opera.postError(arguments);
    }
}

//字符串替换
String.prototype.replaceAll = function (src, dec) {
    return this.replace(new RegExp(src, "gm"), dec);
};

/*
字符串的format 调用如：
"你是{0}, 他是{1}, 我不是{0}，也不是{1}。".format("张三", "王五"));
    
20150327增加对象类型参数的支持
'name={name},sex={sex}'.format({name:'xxx',sex:1});
*/
String.prototype.format = format = function () {
    var args = arguments;
    //如果第一个参数是对象
    var isObject = typeof args[0] === 'object';
    var re = isObject ? /\{(\w+)\}/g : /\{(\d+)\}/g;
    return this.replace(re, function (m, key) {
        return isObject ? isNull(args[0][key]) : isNull(args[key]);
    });
}

//多级对象支持
String.prototype.formatB = formatB = function (template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        try {
            var keys = key.split("."), v = data[keys.shift()];

            if (typeof v === "undefined" || v === null) return "";

            for (var i = 0, l = keys.length; i < l; i++) {
                v = v[keys[i]]
            };
            return (typeof v !== "undefined" && v !== null) ? v : "";
        } catch (e) {
            return "";
        }
    });
}

//显示loading
function loadMask(message) {
    var div = $("#loadingDiv");
    //无此块，创建
    if (div.length === 0) {
        var title = message || '正在拼命为您处理，请等待...';
        var html = '<div  id="loadingDiv"><div class="mask_div"></div><div class="loadingDiv">' +
        '<p class="msg">' + title + '</p>' +
        '<div><img width="114" height="16" alt="loading" src="../css/images/loading.gif" id="flashAdImg"></div>' +
        '<p class="msg2">如长时间无反应，请刷新此页面。</p>' +
        '</div></div>';
        div = $("body").append(html);
    }
    $("#loadingDiv").show();
};

function hideMask() {
    $("#loadingDiv").hide();
};

//显示提示在顶部中间,1秒后自动隐藏
function myalert(msg) {
    var obj = $('<div class="dTopPopMsg">' + msg + '</div>').appendTo('body');
    obj.show("fast").delay(500).slideDown(500, function () { obj.remove(); });
};

/*cookie 操作****/
function setCookie(name, value) {
    var Days = 365;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getCookie(name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) { return unescape(arr[2]); }
    return null;
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
//end cookie

//load html文件，只载入body部分
function loadHtml(divId, url, data, callback, type, async) {
    $.ajax({ url: url, dataType: "html", data: data, type: type, async: (async == undefined ? true : async)
    }).done(function (text) {
        var start = text.indexOf("<body>");
        start = start == -1 ? 0 : start + 6;
        var stop = text.lastIndexOf("</body>");
        stop = stop == -1 ? undefined : stop;
        var html = text.substring(start, stop);
        $(divId).empty().append(html);
    }).complete(callback && function (jqXHR, status) {
        if (callback) { callback.call(jqXHR.responseText); }
    });
};

//下载url页面，并加载到body。
function loadHtml2(dlgId, url, data, callback) {
    var $dlg = $(dlgId);
    //不存在生成
    if ($dlg.length === 0) {
        $.get(url, {}, function (text) {
            var start = text.indexOf("<body>");
            start = start == -1 ? 0 : start + 6;
            var stop = text.lastIndexOf("</body>");
            stop = stop == -1 ? undefined : stop;
            var html = text.substring(start, stop);

            $('body').append(html);

            //$dlg = $(dlgId).addClass('wrap_show'); //动画
            if (callback) callback();
        }, 'html');
    }
    return $dlg;//.show();
}
//加载自助练习块
function loadHtml3(dlgId, url, data, callback) {
    var $dlg = $(dlgId);
    //不存在生成
    if ($dlg.length != 0) {
        $.get(url, {}, function (text) {
            var start = text.indexOf("<body>");
            start = start == -1 ? 0 : start + 6;
            var stop = text.lastIndexOf("</body>");
            stop = stop == -1 ? undefined : stop;
            var html = text.substring(start, stop);

            $dlg.empty().append(html);
            if (callback) callback();
        }, 'html');
    }
}

/*ajax setup 全局性设置，主要是对提示的自动处理
如果自定义提示，则global: false*/
(function () {
    $.ajaxSetup({
        type: "POST", cache: false, dataType: 'json'
    });

    //定义JAAX执行的全局事件，实现自动提示信息
    $(document).ajaxSend(function (event) {
        var obj = $("#topTips");
        if (obj.length === 0) {
            obj = $('<div id="topTips" class="moveIn">正在努力为您处理…</div>').appendTo('body');
        }
    }).ajaxComplete(function (event, xhr, settings) {
        $("#topTips").remove();
    }).ajaxError(function (event, xhr, settings) {
        $("#topTips").remove();
        jAlert(xhr.responseText);
    });

})();

/*
表单：getParam getXMLPars post postB
执行：query exec
载入数据：data2Edit data2Table  loadData loadPageData
*/
$.fn.getPars = $.fn.getParam = function () {
    var obj = {};
    $(this).find("[name]").each(function (i, v) {
        var me = $(this);
        var name = me.attr("name");
        if (name) {
            if (me.is(":checkbox")) {
                if (me.attr("ucheckbox")) {
                    obj[name] = me.prop("checked");
                } else {
                    //取选择的checkbox的值,以逗号分隔
                    if (me.is(":checked")) {
                        if (obj[name]) {
                            obj[name] += "," + me.val();
                        } else {
                            obj[name] = me.val();
                        }
                    }
                }
            } else if (me.is(":radio")) {
                if (me.is(":checked")) {
                    obj[name] = $(v).val();
                }
            } else if ('value' in this) {
                //input select textarea
                obj[name] = $(v).val();
            } else {
                //html decodeURIComponent 20160416 主要针对在线编辑器的情况
                obj[name] = encodeURIComponent($(v).html());
            }
        }
    });
    return obj;
};

//生成明细表XML 格式的参数
//checkbox只保存最后一值，不然多层xml在数据库处理也不好办。
$.fn.getXMLPars = function () {

    var doc = createXMLDOM("<row></row>");
    var row = doc.documentElement, attr;
    var form = $(this);
    form.find("[name]").each(function () {
        var me = $(this);
        var name = me.attr("name");
        if (me.is(":checkbox")) {
            if (me.is(":checked")) {
                attr = row.getAttribute(name);
                row.setAttribute(name, (attr ? attr + ',' : '') + me.val());
            }
        } else if (me.is(":radio")) {
            if (me.is(":checked")) {
                row.setAttribute(name, me.val());
            }
        } else if ('value' in this) {
            row.setAttribute(name, me.val());
        } else {
            //20160720 用html()无法取到input的value
            me.find('input').each(function () {
                var input = $(this);
                if (input.is(':checkbox') || input.is(':radio')) {
                    input.prop('checked') ? input.attr('checked', 'checked') : input.removeAttr('checked');
                } else {
                    input.attr('value', input.val());
                }
            });
            //20160720 用html()无法取到select的value
            me.find('select').each(function () {
                $(this).find("option:selected").attr("selected", "selected").siblings().removeAttr("selected");
            });
            //20160416 html decodeURIComponent 主要针对在线编辑器的情况
            row.setAttribute(name, decodeURIComponent(me.html()));
        }
    });

    //var xml = dataset.innerHTML; ie有问题
    return XML2String(row);
};

$.fn.post = function (url, callback) {
    $.ajax({
        url: url,
        dataType: "json",
        data: getParam(this),
        success: function (res) {
            if (res.success) {
                if (callback) { callback.call(res); }
            } else {
                jAlert(res.message);
            }
        },
        error: function (e, r, t) {
            jAlert(r);
        }
    });
}

//跨浏览器生成XMLDOM
createXMLDOM = function (xmlStr) {
    var xmlDom = null;
    if (typeof window.DOMParser != "undefined") {
        xmlDom = (new DOMParser).parseFromString(xmlStr, "text/xml");
        var errors = xmlDom.getElementsByTagName("parsererror");
        if (errors.length > 0) {
            throw new Error("错误信息：" + errors[0].textContent);
        }
    } else if (typeof window.ActiveXObject != "undefined") {
        var version = ["MSXML2.DOMDocuemnt6.0", "MSXML2.DOMDocument3.0", "MSXML2.DOMDocument"];
        for (var i = 0; i < version.length; i++) { // 判断IE8以下的浏览器使用
            try {
                xmlDom = new ActiveXObject(version[i]);
            } catch (e) { }
        }
        xmlDom.loadXML(xmlStr); // IE下面 获取xml
        if (xmlDom.parseError != 0) {
            throw new Error("错误信息：" + xmlDom.parseError.reason);
        }
        return xmlDom;
    } else {
        throw new Error("您的浏览器或者系统不支持XML DOM对象! ");
    }
    return xmlDom;
};

//跨浏览器序列化XMLDOM
XML2String = function (xmlDom) {
    var xml = "";
    if (typeof window.XMLSerializer != "undefined") {
        xml = (new XMLSerializer()).serializeToString(xmlDom);
    } else if (typeof xmlDom.xml != "undefined") {
        xml = xmlDom.xml;
    }
    return xml;
}

//xml格式data 转json
function xml2json(xml) {

    var data = [];

    $(xml).each(function(){
        var obj={};
        for (var j = 0, len=this.attributes.length; j < len; j++) {
            var attribute = this.attributes.item(j);
            obj[attribute.nodeName] = attribute.nodeValue;
        }
        data.push(obj);
    });
    
    return data;
}; 

//编辑块数据载入，只处理自定义属性name,function处理
$.fn.data2Edit = function (obj) {
    if ($.type(obj) !== 'object') return this;

    var dv = $(this), el, value;
    
    //2016-04-12 gooddeng 把循环表单元素改为循环obj属性
    for(var name in obj){
        value = isNull(obj[name]);

        var el = dv.find('[name="'+name+'"]');

        //如果不存在元素，创建一个input:hidden
        if(el.length===0){
            el = $('<input type="hidden" name="'+name+'" />').appendTo(dv);
        }

        if (el.is(":checkbox,:radio")) {
            //允许checked多项，逗号分隔
            el.val((value + '').split(","));
        } else if (el.is("input,select,textarea")) {
            el.val(value);
        } else if (el.is("img")) {
            el.attr('src',value);
        } else if (el.is("a")) {
            el.attr('href',value);
        } else {
            //20160416 decodeURIComponent 
            //el.html(decodeURIComponent(value));
            el.html(value);
        }        
    }
    return dv;
};

//根据数据，刷新列表某行,存在更新，不存在新加
//20160807 增加isPrepend参数，使可以前插
$.fn.refreshData = function (data, PKeyId, callback, isPrepend) {

    var list = $(this);

    //获取主键值，查找定位数据行
    var rowid = data.rowid ? data.rowid : data[PKeyId];

    //查找数据行是否存在
    var row = list.find("[data-rowid='" + rowid + "']");

    //存在数据行，补全数据
    if (row && row.length) {
        data = $.extend(row.data('data'), data);
    } else {
        var count = list.find("[data-rowid]").length + 1;
        data.index = count;
    }
    //根据模板生成行
    var tmpl = list.find(".template_object");
    //if (tmpl.length === 0) return;    

    var render = tmpl.template().render;
    var new_row = $(render(data)).data('data', data);

    if (row && row.length) {
        //row.after(new_row);
        //new_row[0].className = row[0].className;
        //row.remove();
        row.html(new_row.html());
    } else {
        isPrepend ? list.prepend(new_row) : list.append(new_row);
    }

    if (callback) {
        callback.call(new_row, data);
    }
    return new_row;
};

// 精简模板实现
// 不带参数，返回模板函数，重复调用效率高。
// 带varname 将不用with(obj) 自己在模板中指定对象名
// 如果是函数要当前记录值，则参数加obj{functionName(obj)}
// 20160818 实现render方法的缓存,调用方法改为$().template().render;
$.fn.template = $.fn.tmpl = function (data, varname) {
    //20160818 取缓存方法
    var render = this.data('render');
    if (render) {
        return { render: render }
    }

    //取模板内容
    var text = this.html();

    // 需要转义的字符
    var escaper = /\\|'|\r|\n|\t/g;
    var escapes = { "'": "'", '\\': '\\', '\r': 'r', '\n': 'n', '\t': 't' };
    var escapeChar = function (match) {
        return '\\' + escapes[match];
    };
    // 解析变量或表达式：{evaluate} 转为:'+evaluate+';
    var matcher = /\{([\s\S]+?)\}|$/g;

    // 生成函数脚本代码
    var index = 0;
    var code = "__h+='";

    text.replace(matcher, function (match, evaluate, offset) {
        //if (evaluate === undefined) return;

        code += text.slice(index, offset).replace(escaper, escapeChar);
        index = offset + match.length;

        code += "'+ " + evaluate + "+\n'";

        return match;
    });
    code += "';\n";

    // 如果定义的变量名，则不用with，默认为with(obj)
    if (!varname) code = 'with(obj||{}){\n' + code + '}\n';

    code = "var __h='';\n" + code + "return __h;\n";

    //20160818 缓存render方法，并返回对象方法render使不用重复调用生成模板函数。
    render = new Function('obj', code);
    this.data('render', render);

    return {
        render: render
    }   

};

//模板，对John Resig的实现完善。去掉with 用apply
var tmpl = (function (cache, $) {
    return function (str, data) {
        var fn = !/\s/.test(str)
        ? cache[str] = cache[str]
        || tmpl(document.getElementById(str).innerHTML)
        : function (data) {
            var i, variable = [$], value = [[]];
            for (i in data) {
                variable.push(i);
                value.push(data[i]);
            };
            return (new Function(variable, fn.$)).apply(data, value).join("");
        };

        fn.$ = fn.$ || $ + ".push('"
        + str.replace(/\\/g, "\\\\")
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join($ + ".push('")
        .split("\r").join("\\'")
        + "');return " + $;
        return data ? fn(data) : fn;
    }
})({}, '$' + (+new Date));

//把[[]] to [{}]
function array2object(arrs) {
    if (arrs.length === 0) { return {}; }
    //第一行为字段名
    var fieldlist = arrs[0];
    var res = [];

    for (var i = 1, len = arrs.length; i < len; ++i) {
        var arr = arrs[i];
        var obj = {};
        //for (var j in arr) {
        for (var j in fieldlist) {
            var fieldname = fieldlist[j];
            if (j < arr.length)
                obj[fieldname] = arr[j];
            else
                obj[fieldname] = null;
        }
        res.push(obj);
    }
    return res;
};

//数组数据显示到元素
//要求定义显示模板
$.fn.data2Table = function (data, temp, isPage, isClearData) {
    var tb = $(this), isClearData = (isClearData === undefined ? true : isClearData);

    //清除原内容，区分表格，表格只empty tbody
    var tbody;
    if (tb.is("table")) {
        tbody = tb.find("tbody:first");
        if (isClearData) tbody.empty();

        //无tbody标签，增加之
        if (tbody.length === 0) {
            tbody = tb.append("<tbody></tbody>").find("tbody:first");
        }
    } else {
        tbody = tb;
        if (isClearData) tbody.children(":not(.template_object)").remove();
    }

    //没有数据，直接返回。
    if (data === "" || !data.length) { return this; }

    //转换CSV数组格式[[]]格式 to [{}]
    if ($.isArray(data[0])) {
        data = array2object(data);
    }

    var tmpl = temp || tb.find(".template_object");
    if (tmpl.length === 0) { jAlert("必须定义数据显示模板"); return this; }
    
    //生成模板函数
    var render = tmpl.template().render;

    //逐行加入
    var html = '';
    var fragment = document.createDocumentFragment();
    $(data).each(function (i, d) {
        //序号自动生成，分页的查询序号区别处理
        if (d.index === undefined) {
            var xh = i + 1;
            d.index = isPage ? (pageNav.curPageNum - 1) * 20 + xh : xh;
        }
        //斑马线
        d.zebra = d.index % 2 ? '' : 'zebra';

        //生成全部html再一次加入，会快一些。
        //html += render(d);
        //为减少和服务器的数据交互，缓存到data
        var row = $(render(d));
        row.data('data', d);
        fragment.appendChild(row[0]);
    });
    //tbody.append(html);
    tbody[0].appendChild(fragment);
    
    return this;
};

$.fn.XML2Table = function(data, temp, isPage, isClearData){
    var json = xml2json(data);
    $(this).data2Table(json, temp, isPage, isClearData);
};

$.fn.loadData = function (url, data, callback) {   
    var tb = $(this);
    $.ajax({
        url:url, data: data, dataType: "json",
        success: function (res) {
            if (res.success) {
                //载入数据,没有定义模板，以编辑块方式载入
                if (tb.find(".template_object").length === 0) {
                    tb.data2Edit(res.data[0]);
                } else {
                    tb.data2Table(res.data);
                }
                //成功回调事件
                if (callback) { callback.call(res); }
            } else {
                jAlert(res.message);
            }
        }
    });
    return this;
};

$.fn.loadXMLData = function (url, data, callback) {   
    var tb = $(this);
    $.ajax({
        url:url, data: data, dataType: "json",
        success: function (res) {
            if (res.success) {
                var data = xml2json(res.data);
                //载入数据,没有定义模板，以编辑块方式载入
                if (tb.find(".template_object").length === 0) {
                    tb.data2Edit(data[0]);
                } else {
                    tb.data2Table(data);
                }
                //成功回调事件
                if (callback) { callback.call(res); }
            } else {
                jAlert(res.message);
            }
        }
    });
    return this;
};
//查询数据 如果filter是对象则exec
query = function (url, viewname, filter, fields, callback, isarray) {
    var parms = {};
    //如果参数是对象
    if (typeof filter == 'object') {
        parms = $.extend(filter, {
            method: "exec", procname: viewname
        });
    } else {
        parms.method = "select";
        parms.filter = filter;
        parms.array = isarray; //isarray = 1 返回CSV数组格式
        parms.viewname = viewname;
        parms.fields = fields;
    }

    $.ajax({
        url: url ? url : "../AjaxHelper.ashx",
        data: parms,
        dataType: "json",
        success: function (res) {
            if (callback) { callback.call(res); }
        }
    });
};

//执行存储过程,示例:exec("uspGetFilesList", { YWFL: "初始注册", MainId: "32", TableName: "rai_init" },callback);
exec = function (proc, obj, callback, asyn) {
    var asyn = asyn == undefined ? true : asyn;
    var parms = $.extend(obj, {
        method: "exec", procname: proc
    });
    $.ajax({
        url: "../AjaxHelper.ashx",
        dataType: "json", async: asyn,
        data: parms,
        success: function (res) {
            if (callback) { callback.call(res); }
        }
    });
};

function csv2json(csv) {
    if (!csv) return false;

    var arr = csv.split("\r\n");

    var i = 0, len = arr.length, json = [];
    for (; i < len; i++) {
        if (arr[i]) {
            var row = arr[i].replaceAll("\"", "").split(",");
            json.push(row);
        }
    }

    return json;
};

//tree 20160107 改为jquery插件
$.fn.tree = function (option) {
    var defaults = {
        data: null, //csv或[]数据
        isShow: false, //自动展开节点
        notTitle: true, //csv第一行非标题行
        isClear: true, //清空树及缓存数据
        addOtherData: null //附加节点函数
    };
    var option = $.extend(defaults, option);

    var self = this;

    function createLi(arr) {
        var el = document.createElement('li');

        //el.className = 'leaf';
        var link = document.createElement('a');
        link.setAttribute('id', arr[0]);
        link.setAttribute('pid', arr[1]);
        if (arr.length > 4 && arr[4]) {
            link.setAttribute('tempid', arr[4]);
            if (arr[3] == 1) $(el).addClass('leaf');
        }
        if (arr.length > 5 && arr[6]) link.setAttribute('gbcode', arr[6]);

        //图标 合并到link 
        /*var span = document.createElement('div');
        span.className = 'btn';
        link.appendChild(span);*/

        link.appendChild(document.createTextNode(arr[2].replaceAll("\"", "")));
        el.appendChild(link);

        if (option.addOtherData) {
            option.addOtherData(el, arr);
        }
        return el;
    };

    //最精简，最高效的树结构生成 20150914
    //不采用递归的方式实现，算法再次精简
    //数据格式为csv,如非数组，先进行转化，数组格式为：[[id,pId,name,isLeaf],...]
    //2015101 增加节点，重复的不处理，新建表格时调用
    function loadData() {
        //清空树及缓存数据
        if (option.isClear) {
            $(self).removeData('hashlist');
            $(self).empty();
        }

        //数据格式转化
        var data = [];
        if ($.isArray(option.data)) {
            data = option.data;
        } else {
            data = csv2json(option.data);
        }
        if (!data) return;

        //生成所有元素li, hash列表快速找父亲，通过tree.hashlist无需递归生成树
        var i = option.notTitle ? 0 : 1,
                len = data.length,
                parent, el, arr;

        if (len === 0) return;

        //生成haslist并存储到tree控件
        var hashlist = $(self).data('hashlist');
        if (!hashlist) {
            hashlist = {};
            $(self).data('hashlist', hashlist);
        }

        var arraylist = [];
        for (; i < len; i++) {
            arr = data[i];
            if (!hashlist[arr[0]]) {
                el = createLi(arr);
                hashlist[arr[0]] = { pId: arr[1], node: el, level: 0, isLeaf: arr[3] };
                arraylist.push(hashlist[arr[0]]);
            }
        }

        //生成根节点ul
        var $root = $(self).children('ul'), isFirst = false, root;
        if ($root.length === 0) {
            isFirst = true;
            //采用DocumentFragment提高效率, 和xml效率差不多，但不需要xml支持
            var fragment = document.createDocumentFragment();
            root = document.createElement('ul');
            //root.className = 'level0';
            fragment.appendChild(root);
        } else {
            root = $root[0];
        }

        //生成ul, li找父亲ul  
        var obj, ulist, ul, level, nextLink;
        for (var j = 0, len = arraylist.length; j < len; j++) {
            obj = arraylist[j];

            //找父亲
            parent = hashlist[obj.pId];
            if (!parent) {
                //无父加到root
                root.appendChild(obj.node);
                obj.node.className = 'level0';
                if (option.isShow) obj.node.className = 'level0 open'; //加入open样式
            } else {
                //有则取li父节点的ul
                ul = parent.node.lastChild;

                //无ul 生成ul
                if (!ul || ul.nodeName !== 'UL') {
                    ul = document.createElement('ul');
                    // if (option.isShow) $(ul).show();

                    parent.node.appendChild(ul);
                }

                //节点层级计算，取父亲+1
                //level = parent.level + 1;
                //obj.level = level;
                //obj.node.className = 'level' + level; // +(obj.isLeaf == '1' ? ' leaf' : '');
                //$(obj.node).addClass('level' + level);
                //ul.className = 'level' + level + (obj.isLeaf == '1' ? ' leaf' : '');

                //li挂到ul内
                if (option.isShow) obj.node.className = "open"; //加入open样式
                ul.appendChild(obj.node);
            }
        }

        //全树挂载显示。
        if (isFirst) {
            $(self).append(fragment);
            $(root).find('li:first').addClass('open');
        }
    }

    loadData();
};

//删除右边的空格,防止空格多条件查询时，只输入多空格会无响应脚本
function rtrim(str) {
    return str.replace(/(\s*$)/g, "");
}

/*
实现标题拖动窗口块
窗口块结构要求：
<div class='drag'>
<h3 class='title'></h3>
<div></div>
</div>
20160219改为插件方式，支持多个窗口的拖动。
*/
$.fn.drag = function () {
    $.each(this, function () {
        var el = $(this); // $(".drag>.title");
        var elParent = el.parent();
        if (elParent == undefined) return false;

        var _move = false; //移动标记
        var startPos = { x: 0, y: 0 };  //鼠标离控件左上角的相对位置  
        el.mousedown(function (e) {
            _move = true;
            //记录初始座标
            var pos = elParent.offset();
            startPos.x = e.pageX - pos.left;
            startPos.y = e.pageY - pos.top;

            //拖动事件bind
            el.mousemove(function (e) {
                if (_move) {
                    var x = e.pageX - startPos.x;
                    var y = e.pageY - startPos.y;
                    elParent.css({ top: y, left: x });
                }
            }).mouseup(function (e) {
                _move = false;
                el.unbind("mousemove");
            });
        });
    });
};

//20150118 重构jAlert jConfirm jPrompt，几百行浓缩为几十行
function createDlg(message, title, icon) {
    var title = title || '提示';
    var icon = icon || 'alert';
    var html = ['<div class="popup_wrap notSelect">',
        '<div class="mask_div"></div>',
        '<div class="popup_dlg">',
            '<h1>' + title + '</h1>',
            '<div class="popup_content"><div class="popup_icon ' + icon + '"></div><div class="popup_message">' + message + '</div></div>',
            '<div class="popup_toolbar"></div>',
        '</div></div>'];
    return $(html.join('')).appendTo('body');
};

function jAlert(message, title, callback) {
    var $dlg = createDlg(message, title, 'alert');
    var $toolbar = $dlg.find('.popup_toolbar');

    $('<button>确定</button>').click(function () {
        $(this).closest('.popup_wrap').remove();
        if (callback) callback(true);
    }).appendTo($toolbar);
}

function jConfirm(message, title, callback) {
    var $dlg = createDlg(message, title, 'confirm');
    var $toolbar = $dlg.find('.popup_toolbar');

    $('<button>确定</button>').click(function () {
        $(this).closest('.popup_wrap').remove();
        if (callback) callback(true);
    }).appendTo($toolbar);
    $('<button>取消</button>').click(function () {
        $(this).closest('.popup_wrap').remove();
        if (callback) callback(false);
    }).appendTo($toolbar);
};

function jPrompt(message, value, title, callback) {
    var value = value || '';
    var $dlg = createDlg(message + '<br/><input class="popup_text" type="text" value="' + value + '" />', title, 'prompt');
    var $toolbar = $dlg.find('.popup_toolbar');

    $('<button>确定</button>').click(function () {
        var $wrap = $(this).closest('.popup_wrap');
        $wrap.remove();
        if (callback) {
            var val = $wrap.find('.popup_text').val();
            callback(val);
        }
    }).appendTo($toolbar);
    $('<button>取消</button>').click(function () {
        $(this).closest('.popup_wrap').remove();
        if (callback) callback(false);
    }).appendTo($toolbar);
};

//下拉块的定位
function dropdownOffset(el, combox) {
    var isFixed = false, et = $(el);
    et.parents().each(function () {
        isFixed |= $(this).css("position") === "fixed";
        return !isFixed;
    });

    combox.css('position', isFixed ? 'fixed' : 'absolute');

    var _ww = $(window).width();
    if (_ww < 1000) {
        //居中显示
        combox.css({
            left: '50%',
            top: '50%',
            'margin-left': -combox.width() / 2 + 'px',
            'margin-top': -combox.height() / 2 + 'px'
        });
    } else {
        var pos = et.offset();
        pos.top += et.outerHeight() * 1;
        if (isFixed) {
            pos.top -= $(window).scrollTop();
            pos.left -= $(window).scrollLeft();
        }
        combox.css({
            left: pos.left,
            top: pos.top
        });
    }

    return combox;
}
/*
2016-04-13 gooddeng
最新写的最简洁的日期选择器。
*/
//Date对象加 本月一号是星期几的方法
Date.prototype.getFirstDayWeek = function () {
    var d = new Date(this);
    d.setDate(1);
    return d.getDay()
};

//Date对象加 本月多少天的方法
Date.prototype.getDaysInMonth = function () {
    var d1 = new Date(this), d2 = new Date(this);
    d1.setDate(1);
    d2.setDate(1);
    d2.setMonth(d2.getMonth() + 1);
    return (d2 - d1) / 86400000;
};


//根据日期创建本月的日历表
datepicker = {
    _generateHTML: function (D) {
        var year = D.getFullYear(), month = D.getMonth() + 1, day = D.getDate();

        //先生成所有的单元格
        var btnUpdate = function (addYear, addMonth, icon) {
            return '<th class="btn" data-click="update" data-param="{0},{1}">{2}</th>'.format(addYear, addMonth, icon);
        }

        var _html = ['<table>'];
        _html.push('<tr class="toolbar">' + btnUpdate("-1", "0", "«") + btnUpdate("0", "-1", "<") + '<th colspan=3>' + year + '-' + month + '-' + day + '</th>' + btnUpdate("0", "1", ">") + btnUpdate("1", "0", "»") + '</tr>');

        //生成周单元格
        _html.push('<tr class="week">');
        var week = ['日', '一', '二', '三', '四', '五', '六'];
        for (var i = 0; i < week.length; i++) {
            _html.push('<th>' + week[i] + '</th>');
        }
        _html.push('</tr>');

        var cells = [];

        //初始行空白单元格
        for (var i = 0; i < D.getFirstDayWeek(); i++) {
            cells.push('<th></th>');
        }

        //日期单元格单元格
        for (var i = 0; i < D.getDaysInMonth(); i++) {
            cells.push('<td data-date="{0}-{1}-{2}" data-click="setdate">{2}</td>'.format(year, month, i + 1));
        }

        //剩余空白单元格
        var toend = cells.length % 7;
        if (toend != 0) {
            for (var i = 0; i < 7 - toend; i++) {
                cells.push('<th> </th>');
            }
        }

        for (var i = 0; i < cells.length; i++) {
            _html.push((i == 0 ? '<tr>' : i % 7 == 0 ? '</tr><tr>' : '') + cells[i] + (i == cells.length - 1 ? '</tr>' : ''));
        }

        return _html.join('');
    },

    update: function (wrap, addYear, addMonth) {
        //创建日期选择器
        var D = wrap.data('date') || new Date;

        addYear && D.setYear(D.getFullYear() + addYear * 1);
        addMonth && D.setMonth(D.getMonth() + addMonth * 1);
        wrap.data('date', D);

        wrap.html(datepicker._generateHTML(D));
    },

    curPicker: null, //当前活动的日历

    show: function (el) {
        if (!el) return;

        //创建的datepicker 缓存在 data-picker
        var $picker = $(el).data('picker');

        //不存在创建日历
        if (!$picker || $picker.length === 0) {
            $picker = $('<div class="datepicker unselectable"></div>');

            /*isFixed = false;
            $(el).parents().each(function () {
                isFixed |= $(this).css("position") === "fixed";
                return !isFixed;
            });

            if (isFixed) {
                $picker.css('position', 'fixed');
            }

            var pos = $(el).offset();
            $picker.css({ left: pos.left, top: pos.top + el.offsetHeight });*/

            $picker.delegate('td,th', 'click', function (e) {
                var cell = $(e.target);
                var action = cell.data('click');
                if (action == "setdate") {
                    $(el).val(cell.data('date'));
                    validate.check(el);
                    $picker.hide();
                } else if (action == "update") {
                    var param = cell.data('param').split(',');
                    datepicker.update($picker, param[0], param[1]);
                }
            });

            $picker.data('el', el);
            $picker.data('date', new Date);

            datepicker.update($picker, 0, 0);
            document.body.appendChild($picker[0]);
            //$(el).after($picker);

            $(el).data('picker', $picker);
        }

        this.curPicker = $picker;

        $picker.show();
    }
};

validate = {
    hasError: false,

    error_tip_tmpl: '<div class="error-tip"><div class="message">{0}</div><div class="arrow_out"><div class="arrow_in"></div></div>',

    rphone: /^[1][358][0-9]{9}$/,
    rtel: /^0\d{2,3}-\d{5,9}$/,

    isIDCard: function (val) {
        //位数及基本字符判断
        if (!/^\d{17}(\d|x)$/i.test(val) && !/^\d{15}$/i.test(val)) {
            //alert("身份证号不正确");//位数不符
            //alert("we");
            return false;
        }

        var aCity = "11,12,13,14,15,21,22,23,31,32,33,34,35,36,37,41,42,43,44,45,46,50,51,52,53,54,61,62,63,64,65,71,81,82,91";
        var iSum = 0;
        var idCardLength = val.length;
        var sBirthday;

        var curCity = val.substr(0, 2);
        if (aCity.indexOf(curCity) == -1) {
            //alert("地区码不符");//地区码不符
            return false;
        }
        if (idCardLength == 18) {
            sBirthday = val.substr(6, 4) + "-" + Number(val.substr(10, 2)) + "-" + Number(val.substr(12, 2));
            var d = new Date(sBirthday.replace(/-/g, "/"));
            if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {
                return false;
            }
            //计算校验位
            var Y, JYM, S, M;
            var idcard_array = new Array();
            idcard_array = val.split("");
            S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7
                + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9
                + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10
                + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5
                + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8
                + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4
                + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2
                + parseInt(idcard_array[7]) * 1
                + parseInt(idcard_array[8]) * 6
                + parseInt(idcard_array[9]) * 3;
            Y = S % 11;
            M = "F";
            JYM = "10X98765432";
            M = JYM.substr(Y, 1); /*判断校验位*/
            return M == idcard_array[17];
        }
        else if (idCardLength == 15) {
            //出生年份birthdayYear 360421660518501
            var birthdayYear = val.substr(6, 2);
            if (parseInt(birthdayYear) < 10) {
                birthdayYear = '20' + birthdayYear;
            }
            else {
                birthdayYear = '19' + birthdayYear;
            }
            sBirthday = birthdayYear + "-" + Number(val.substr(8, 2)) + "-" + Number(val.substr(10, 2));
            var d = new Date(sBirthday.replace(/-/g, "/"))
            var dd = d.getFullYear().toString() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

            if (sBirthday != dd) {
                return false;
            }
        }
        return true;
    },

    isDate: function (str) {
        try {
            var arr = str.split('-'),
                year = arr[0], month = arr[1] - 1, date = arr[2];

            var obj = new Date(year, month, date);
            return !!(obj.getFullYear() == year && obj.getMonth() == month && obj.getDate() == date);
        } catch (e) { return false }
    },

    //显示或创建错误提示
    showErrorTip: function (el, msg) {
        this.hasError = true;

        if (!el) return;

        var $el = el, $tip = el.data('error-tip');
        if ($el.length === 0) return;

        //提示信息全放一起
        var wrap = $('#validateWrap');
        if (wrap.length === 0) {
            wrap = $('<div id="validateWrap"></div>');
            $('body').append(wrap);
        }

        if (!$tip || $tip.length === 0) {
            $tip = $(this.error_tip_tmpl.format(msg)).appendTo(wrap);//.insertAfter(el);
            $el.data('error-tip', $tip);
        } else {
            $tip.find('.message').html(msg);
        }

        $el.addClass('validate-error');

        var pos = $el.offset();//.position();
        pos.top = pos.top - $tip.outerHeight() - 8;
        pos.left = pos.left + $el.outerWidth() - 40;

        $tip
        .css({ top: pos.top, left: pos.left })
        .show();
    },

    //删除错误提示
    removeErrorTip: function (el) {
        el.removeClass('validate-error');
        var $tip = el.data('error-tip');
        if ($tip) {
            el.removeData('error-tip');
            $tip.remove();
        }
    },

    removeAllTip: function () {
        $('#validateWrap').empty();
    },

    //进行检验
    check: function (el) {
        var me = this, input = $(el);
        var option = input.data('data');
        if (!option) {
            var data = input.data('option');
            if (!data) return;

            //转json格式
            option = eval('(' + data + ')');
            input.data('data', option);
        }
        if (!option) return;

        //只发现每一个错误

        var found = false, msg, value = input.val() || input.html();
        //必填的校验
        if (option.required && value == "") {
            msg = '此字段必须填写';
            found = true;
        } else if (option.type == 'number' && (value == "" || isNaN(value))) {
            msg = '要求填写数字格式';
            found = true;
        } else if (option.type == 'date' && !me.isDate(value)) {
            msg = '请填写正确的日期';
            found = true;
        } else if (option.type == 'tel' && !me.rtel.test(value)) {
            msg = '请填写正确的固定电话';
            found = true;
        } else if (option.type == 'phone' && !me.rphone.test(value)) {
            msg = '请填写正确的手机号码';
            found = true;
        } else if (option.type == 'idcard' && !me.isIDCard(value)) {
            msg = '请填写正确的身份证号';
            found = true;
        } else if (option.max && value * 1 > option.max) {
            msg = '填写数据不能大于' + option.max;
            found = true;
        } else if (option.min && value * 1 < option.min) {
            msg = '填写数据不能小于' + option.max;
            found = true;
        } else if (option.pattern) {
            var exp = new RegExp(option.pattern, "g");
            if (!exp.test(value)) {
                msg = '不符合正则表达式要求';
                found = true;
            }
        }

        if (found) {
            //setTimeout(function () { input.select() }, 1);
            validate.showErrorTip(input, msg);
        } else {
            validate.removeErrorTip(input);
        }
        //有错误返回true
        return found;
    },

    checkForm: function (id) {
        var self = this, error = false;
        $(id).find('[name]').each(function () {
            if (self.check(this) && !error) {
                error = true;
            }
        });
        //有错误返回true
        return error;
    }
}

/*
表单的集中处理实现

日期选择器的显示和隐藏
输入校验的实现

*/
$(function () {
    //实现点击非日历区域，隐藏日历
    $(document).mousedown(function (evt) {
        var target = evt.target;

        var picker = datepicker.curPicker;

        if (!picker) return;

        if (picker.has(target).length === 0) {
            picker.hide();
        }

    });

    //日期选择器的显示
    $(document).delegate('input', 'focus', function () {
        var self = $(this);

        //取input设置的data-option
        var option = self.data('data');
        if (!option) {
            var data = self.data('option');
            if (!data) return;

            //转json格式
            option = eval('(' + data + ')');
            self.data('data', option);
        }

        //日期选择器显示
        if (option.type == 'date') {
            datepicker.show(this);
        }
    });

    //失去焦点时，校验
    $(document).delegate('input', 'blur', function (evt) {
        validate.check(this);
    });

});

function switchTab(el) {
    var me = $(el);
    if (me.hasClass("active")) return;
    var curTab = me.siblings('.active');//console.log(curTab);
    curTab.removeClass('active');

    var old_tabid = curTab.data('tabid');
    var tabid = me.data('tabid');
    $(old_tabid+','+tabid).toggle();
    me.addClass('active');

}

$.fn.transition = function (className, delay) {
    var me = $(this);
    me.addClass(className);
    setTimeout(function () { me.removeClass(className); }, delay || 500);
    //return this;
}

/*
最简洁的html5文件上传插件 
20150616 gooddeng 采用jquery form
20160725 gooddeng 进一步简化,去掉jquery form，直接ajax，直接input.click

20160809 gooddeng 分离出webuploader方法，使调用方便，直接用函数实现，上传的元素上onclick=webuploader(this,{option});
*/
$.fn.webuploader = function (moption) {
    $(this).each(function () {
        var self = $(this);

        //触发选择文件
        self.click(function () {
            webuploader(this, moption)
        });
    });
};

function webuploader(el, moption) {
    var option = $.extend({
        url: '/manager/UploadImg.ashx?method=upload',
        acceptFiles: '*',
        filesize: 5,
        getParams: function () { return {}; },
        beforeSend: function (a, b, c) { },
        success: function (res) { }
    }, moption);


    var self = $(el);

    var fileInput = $("<input type='file'/>");
    fileInput.attr('accept', option.acceptFiles);

    //选择文件后即提交
    fileInput.change(function (evt) {
        var fileName = fileInput.val();

        var accepts = fileInput.attr('accept').toLowerCase();
        var ext = fileName.split('.').pop().toLowerCase();
        if (accepts != '*' && accepts.indexOf(ext) === -1) {
            jAlert('不允许此类型文件上传。');
            return;
        }

        if (this.files[0].size > option.filesize * 1024 * 1024) {
            jAlert('文件大小超过,限制:' + option.filesize + 'M');
            return;
        }

        //20160721 不再使用jQuery Form Plugin 直接html5 ajax式上传实现
        var formData = new FormData();
        /*添加参数*/
        var ParamData = option.getParams.call(self);
        for (var name in ParamData) {
            formData.append(name, ParamData[name]);
        }
        formData.append('file', this.files[0]);
        //submit
        $.ajax({
            url: option.url, type: 'POST', dataType: 'text', cache: false,
            data: formData,
            processData: false, contentType: false,
            beforeSend: function (x) {
                option.beforeSend.call(self, x);
            },
            success: function (response) {
                option.success.call(self, response);
            },
            error: function (t, r) {
                jAlert(r);
            }
        })
    }).click();

};
/*gooddeng 2016-07-21 在线编辑器*/
editor = {
    //工具条生成，重点。
    createToolbar: function () {
        var toolbar = $(['<div class="editToolbar unselectable">',
			'<div>',
				'<button class="button" onclick="editor.toggleMenu(this)" ><i class="icon-font-family"></i></button>',
				'<ul class="combox_menu" style="margin-top: -160px;">',
					'<li style="font-family:宋体" data-cmd="font-family" >宋体</li>',
					'<li style="font-family:仿宋" data-cmd="font-family" >仿宋</li>',
					'<li style="font-family:微软雅黑" data-cmd="font-family" >微软雅黑</li>',
					'<li style="font-family:黑体" data-cmd="font-family" >黑体</li>',
					'<li style="font-family:楷体" data-cmd="font-family" >楷体</li>',
					'<li style="font-family:隶书" data-cmd="font-family" >隶书</li>',
					'<li style="font-family:arial" data-cmd="font-family" >arial</li>',
					'<li style="font-family:arial black" data-cmd="font-family" >arial black</li>',
					'<li style="font-family:impact" data-cmd="font-family" >impact</li>',
					'<li style="font-family:times new roman" data-cmd="font-family" >times new roman</li>',
				'</ul>',
				'<button class="button" onclick="editor.toggleMenu(this)" ><i class="icon-font-size"></i></button>',
				'<ul class="combox_menu" style="margin-top: -240px;">',
					'<li style="font-size: 6pt" data-cmd="font-size">6 点</li>',
					'<li style="font-size: 7pt" data-cmd="font-size">7 点</li>',
					'<li style="font-size: 8pt" data-cmd="font-size">8 点</li>',
					'<li style="font-size: 9pt" data-cmd="font-size">9 点</li>',
					'<li style="font-size: 10pt" data-cmd="font-size">10 点</li>',
					'<li style="font-size: 11pt" data-cmd="font-size">11 点</li>',
					'<li style="font-size: 12pt" data-cmd="font-size">12 点</li>',
					'<li style="font-size: 13pt" data-cmd="font-size">13 点</li>',
					'<li style="font-size: 14pt" data-cmd="font-size">14 点</li>',
					'<li style="font-size: 15pt" data-cmd="font-size">15 点</li>',
					'<li style="font-size: 16pt" data-cmd="font-size">16 点</li>',
					'<li style="font-size: 18pt" data-cmd="font-size">18 点</li>',
					'<li style="font-size: 20pt" data-cmd="font-size">20 点</li>',
				'</ul>',
				'<button class="button" data-cmd="bold"><i class="icon-bold"></i></button>',
				'<button class="button" data-cmd="italic"><i class="icon-italic"></i></button>',
				'<button class="button" data-cmd="underline"><i class="icon-underline"></i></button>',
				'<button class="button" data-cmd="strikeThrough"><i class="icon-strikeThrough"></i>   </button>',
				'<button class="button" data-cmd="superscript"><i class="icon-superscript"></i></button>',
				'<button class="button" data-cmd="subscript"><i class="icon-subscript"></i></button>',
				'<button class="button" data-cmd="justifyLeft"><i class="icon-justifyLeft"></i></button>',
				'<button class="button" data-cmd="justifyCenter"><i class="icon-justifyCenter"></i></button>',
				'<button class="button" data-cmd="justifyRight"><i class="icon-justifyRight"></i></button>',
				'<button class="button" data-cmd="removeformat"><i class="icon-removeformat"></i></button>',
                '<div class="button" title="上传资料" onclick="editor.uploadFile(this)"><i class="icon-image"></i></div>',

				'<div class="clearfix"></div>',
			'</div>',
			'</div>'].join(''));        

        //按钮click事件处理
        toolbar.click(function (e) {
            if ($(e.target).data('cmd')) {
                editor.exeCommand(e.target);
                e.stopPropagation();
            }
        });        

        return toolbar;
    },

    uploadFile: function (el) {
        //定位的编辑区
        $(el).closest('.editor').find('[contenteditable]').focus();
        //文件上传实现
        webuploader(el, {
            url: '/Report/Report.ashx?method=upload',
            acceptFiles: '*',
            filesize: 6,
            success: function (response) {
                var res = response.split('|');
                if (res[0] == "1") {
                    var filename = res[1],
                        ext = filename.substr(filename.indexOf('.')).toLowerCase(),
                        html;
                    //如果是图片，显示图片
                    if (ext == ".jpg" || ext == ".bmp" || ext == ".gif" || ext == ".jpeg" || ext == ".png") {
                        html = '<img src="{0}" alt="图片" />'.format(filename);
                    } else {
                        var title = res.length > 2 ? res[2] : "点击下载附件";
                        html = '<a target="_blank" href={0}>{1}</a>'.format(filename, title);
                    }
                    document.execCommand('insertHTML', false, html);
                }
                else {
                    jAlert("上传失败,原因：" + res[1]);
                }
            }
        });
    },

    toggleMenu: function (et) {
        var pos = $(et).offset();

        /*pos.top = pos.top + $(et).outerHeight();
        pos.left = pos.left;
        pos.bottom = 'auto';
        pos.position = 'fixed';*/

        $(et).next()
            //.css(pos)
            .toggle();
    },

    wrapCss: function (cssname, cssvalue) {
        var spanString = $('<span/>', {
            'text': document.getSelection()
        }).css(cssname, cssvalue).prop('outerHTML');

        document.execCommand('insertHTML', false, spanString);
    },

    exeCommand: function (me) {
        var btn = $(me), cmd = btn.data('cmd');
        switch (cmd) {
            case "font-family":
            case "font-size":
                this.wrapCss(cmd, btn.css(cmd));

                btn.parent().hide();
                break;
            default:
                document.execCommand(cmd);
                break;
        }
    }
};

$.fn.editor = function (opt) {
    $.each(this, function () {
        var self = $(this);
        self.attr('contenteditable', 'true').css('overflow', 'auto').wrap('<div class="editor"></div>');
        editor.wrap = self.parent(); 
        editor.wrap.prepend(editor.createToolbar());
    });
};