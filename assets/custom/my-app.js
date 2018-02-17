

// Initialize app
var myApp = new Framework7({
    swipeBackPage: false,
    pushState: true,
    swipePanel: 'both',
    modalTitle: 'Title',
    cache: true,
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// alert app
//alert = function(a,b,c = 'error'){swal(b, a, c);};

// Para os metodos personalizados (custom)
myApp.c = {};

// configuracoes iniciais do app
myApp.c.appConfig = {
    // informacoes do app 
    appLogo: './assets/img/logo.png',
    appName: 'AppName',
    appSlogan: 'appSlogan',
    
    // nome do localStorage
    localStorageName: 'myApp',
    
    // infineteScroll
    infineteScrollEnable: false,
    // Itens carregados por vez
    infineteScrollQtd: 25,

    // URL utilizados nas requisicoes ajax
    urlApi: './backend/',
    // URL das imagens
    urlImg: './backend/img/',
    imgDefault: 'imgDefault.gif',
    // URL dos tamplates de lista
    urlTemplateList: './templates/list/',

    // lista com todas as paginas acessiveis do sistema
    pages: [],
    
    // URL das paginas
    urlPages: './pages/',

    // pagina inicial
    indexPage: 'index.html',
    
    // login
    loginEnable: true,
    pageLogin: 'login',

    // Para os itens abaixo passe TRUE ou FALSE para aplicar em todas as paginas ou informe as paginas em um array
    // Oculta barra superior (label/icones)
    navbarHide: false,
    // Oculta barra inferior (label/icones)
    toolbarHide: false,
    // oculta menu esquerdo (slide)
    panelLeftHide: false,
    // oculta menu direito (slide)
    panelRightHide: true,
};


// set configuracoes iniciais do app
myApp.c.setAppConfig = function (param) {
    $.extend(this.appConfig, param);
};

// lista de notificacoes pendentes
myApp.c.notificationList = [];

// verifica se tem notificacao aberta
myApp.c.notificationOpen = false;

// notificacao do app
myApp.c.notification = function (type, text, title, callback) {
    // nao abre duas notificacoes ao mesmo tempo, add na lista
    if(this.notificationOpen) {
            this.notificationList.push([type, text, title, callback]);
            return;
    }
    this.notificationOpen = true;
    // bloqueia a tela
    var telaBloqueada = $('.modal-overlay-visible').length;
    if(!telaBloqueada){
            $('.modal-overlay').addClass('modal-overlay-visible');
    }
    // type (success, error)
    switch (type) {
        case 'success':
            opc = {ico: 'fa-check-circle-o', title: 'Tudo certo', class: 'notification-success'};
            break;
        case 'error':
            opc = {ico: 'fa-warning', title: 'Opss', class: 'notification-success'};
            break;
        default:
            opc = {ico: '', title: '', class: ''};
            break;
    }
    $('.modal-overlay').attr('style', 'z-index: 19999');
    myApp.addNotification({
        title: '<i class="fa ' + opc.ico + '"></i> <strong>'+(title || opc.title)+'</strong>',
        message: text,
        onClose: function () {
            if(!telaBloqueada){
                $('.modal-overlay').removeClass('modal-overlay-visible');
            }
            $('.modal-overlay').removeAttr('style');
            myApp.c.notificationOpen = false;
            // proxima notificacao da lista se existir
            var proxNotificacao = myApp.c.notificationList.shift();
            if(typeof proxNotificacao !== 'undefined'){
                myApp.c.notification(proxNotificacao[0],proxNotificacao[1],proxNotificacao[2],proxNotificacao[3])
            }
            // callback
            if(typeof callback === 'function') {
                callback();
            }
        }
    });
    return;
};

// getLocalStorage - obtem dados do localStorage - return JSON / null
myApp.c.getLocalStorage = function () {
    return JSON.parse((localStorage.getItem(this.appConfig.localStorageName) || '{}'));
};

// verifica se esta logado no APP se necessario
myApp.c.appLogado = function () {
    if (this.appConfig.loginEnable === true && this.currentPage !== this.appConfig.pageLogin) {
        return (JSON.parse(localStorage.getItem(this.appConfig.localStorageName)).appLogado === true) ? true : false;    
    } else {
        return true;
    }
};

// setLocalStorage - altera ou cria localStorage - return void
myApp.c.setLocalStorage = function (data) {
    localStorage.setItem(this.appConfig.localStorageName, JSON.stringify($.extend(this.getLocalStorage(), data)));
    return;
};

// clearLocalStorage - limpa localStorage - return void
myApp.c.clearLocalStorage = function () {
    localStorage.setItem(this.appConfig.localStorageName, '{}');
    return;
};

// habilita/desabilita navbar (barra superior)
myApp.c.navbarHide = function (pgName) {
    if ($.inArray(pgName, this.appConfig.navbarHide) === -1 && this.appConfig.navbarHide !== true) {
        myApp.showNavbar('.navbar', true);
        $$('.page-content').css('padding-top', '34px');
    } else {
        myApp.hideNavbar('.navbar', true);
        $$('.page-content').css('padding-top', '0px');
    }
};

// habilita/desabilita o painel lateral (direction = "left"/"right", pgName = "nome-da-pagina")
myApp.c.panelHide = function (direction, pgName) {
    // Primeira letra maiuscula restante minusculo
    var directionU = Util.ucfirst(direction);
    var configPanel = this.appConfig['panel' + directionU + 'Hide'];
    // existe permissao para esconder o panel da pagina
    var pemissionExist = ($.inArray(pgName, configPanel) !== -1 || configPanel === true);
    if ((myApp.params.swipePanel == 'both' || myApp.params.swipePanel != direction) && myApp.params.swipePanel !== false && pemissionExist) {
        myApp.params.swipePanel = (directionU == 'Right' ? 'left' : 'right');
    } else if ((myApp.params.swipePanel == direction || myApp.params.swipePanel === false) && pemissionExist) {
        myApp.params.swipePanel = false;
    } else if (myApp.params.swipePanel != direction && !pemissionExist) {
        myApp.params.swipePanel = 'both';
    } else {
        myApp.params.swipePanel = direction;
    }
};

// create html of panel (menu lateral)
myApp.c.createHtmlPanel = function (itens) {
    var codHtml = '<div class="content-block">';
    codHtml += '<div class="top-panel" style="background: url(' + this.appConfig.appLogo + ') no-repeat left center">';
    codHtml += '<div class="name">' + this.appConfig.appName + '</div>';
    codHtml += '<div class="slogan">' + this.appConfig.appSlogan + '</div>';
    codHtml += '</div>';
    codHtml += '<div class="list-block"><div class="list-block"><ul>';
    for (var i in itens) {
        codHtml += '<li>';
        codHtml += '<a href="' + (itens[i].href ? './pages/' + itens[i].href : '#') + '" class="item-content ' + (itens[i].class || '') + ' close-panel">';
        codHtml += '<div class="item-media">';
        codHtml += '<i class="' + (itens[i].ico ? 'fa fa-lg fa-' + itens[i].ico : '') + '"></i>';
        codHtml += '</div>';
        codHtml += '<div class="item-inner">';
        codHtml += '<div class="item-title">' + (itens[i].label || '') + '</div>';
        codHtml += '</div>';
        codHtml += '</a>';
        codHtml += '</li>';
    }
    codHtml += '</ul></div></div>';
    codHtml += '</div>';
    return codHtml;
};

// setPanel
// itens = [{href:'', class:'', label:'', ico:'http://fontawesome.io/icons/'}]
myApp.c.setPanel = function (panel, itens, replace) {
    var htmlPanel = this.createHtmlPanel(itens),
            panel = $('div.panel-' + panel);
    if (replace) {
        panel.html(htmlPanel);
    } else {
        panel.append(htmlPanel);
    }
};

// setPanelLeft
myApp.c.setPanelLeft = function (itens, replace = true) {
    this.setPanel('left', itens, replace);
};

// setPanelRight
myApp.c.setPanelRight = function (itens, replace = true) {
    this.setPanel('right', itens, replace);
};

// Set Toolbar (menu inferior)
// itens = [{href:'', class:'', label:'', ico:'http://fontawesome.io/icons/'}] - o attr "href" e obrigatorio
myApp.c.setToolbar = function (itens) {
    var codHtml = '<div class="toolbar-inner">';
    for (var i in itens) {
        if (typeof itens[i].href == 'undefined') {
            console.warn('O item: ' + (itens[i].label || itens[i].ico) + ',  da Toolbar nao possui o attr "href", favor addiciona-lo!');
        } else {
            codHtml += '<a href="./pages/' + itens[i].href + '" class="link link-toolbar-bottom active-' + itens[i].href.split('.')[0] + ' ' + (itens[i].class || '') + '">';
            codHtml += '<i class="fa fa-2x fa-' + (itens[i].ico || 'question-circle-o') + '" aria-hidden="true"></i><span class="tabbar-label">' + (itens[i].label || '') + '</span>';
            codHtml += '</a>';
        }
    }
    codHtml += '</div>';
    toolbar = $('div#toolbar-bottom').html(codHtml);
};

// habilita/desabilita toolbar (barra inferior)
myApp.c.toolbarHide = function (pgName) {
    if ($.inArray(pgName, this.appConfig.toolbarHide) === -1 && this.appConfig.toolbarHide !== true) {
        tabbarBottom = $('div#toolbar-bottom');
        tabbarBottom.find('.link-toolbar-bottom').removeClass('active');
        tabbarBottom.find('.link-toolbar-bottom.active-' + pgName).addClass('active');
        $('div#page-main [class*=block]').last().css('margin-bottom', '85px');
        mainView.showToolbar();
    } else {
        $('div#page-main [class*=block]').last().css('margin-bottom', '35px');
        mainView.hideToolbar();
    }
};

// loadPage - carrega pagina na view principal
myApp.c.go = function (pgName) {
    pgNameV = pgName.split('.')[0];
    if ($.inArray(pgNameV, this.appConfig.pages) === -1) {
        console.warn('A pagina "' + pgNameV + '" nao registrada, adicione-a em: myApp.c.appConfig.pages');
        mainView.router.loadPage(this.appConfig.urlPages + this.appConfig.indexPage);
    } else {
        mainView.router.loadPage(this.appConfig.urlPages + pgName);
    }
};

// loadPage - index pagina na view principal
myApp.c.goIndex = function () {
    this.go(this.appConfig.indexPage);
};

// para todas as paginas passarem por essas regras
myApp.c.initPage = function (page, callback) {
    var page,
        callback = (typeof callback == 'function') ? callback : function () {};

    // evento antes da animacao da page
    myApp.onPageBeforeAnimation(page, function (pg) {
        // nome da pagina atual
        myApp.c.currentPage = pg.name;
        // controla exibicao da "navbar" (barra superior)
        myApp.c.navbarHide(pg.name);
        // controla exibicao do "panel" (menu lateral)
        myApp.c.panelHide('left', pg.name);
        myApp.c.panelHide('right', pg.name);
        // controla exibicao da "tabbar" (barra inferior)
        myApp.c.toolbarHide(pg.name);
    });

    // evento voltar (class BACK)
    myApp.onPageBack(page, function (pg) {
        // add here your method
    });

    // evento apos a animacao da page
    myApp.onPageAfterAnimation(page, function (pg) {
        // metodos after load page
        myApp.c.afterLoadPage();
        // metodos after load page custom - Global
        if (typeof myApp.c.afterLoadPageGlobal == 'function') {
            myApp.c.afterLoadPageGlobal(pg);
        }
        // metodos after load page custom - for page name
        if (typeof myApp.c['afterLoadPage' + pg.name] == 'function') {
            myApp.c['afterLoadPage' + pg.name](pg);
        }
        // verifica se esta logado se necessario
        if (!myApp.c.appLogado()) {
            myApp.c.logout();
            return;   
        } else {
            // calback do load
            callback(pg);
        }
    });
};

// funcoes que sempre devem rodar apos carregar a pagina
myApp.c.afterLoadPage = function () {
    // start calendar
    this.initCalendar();
    // start money
    this.initMoney();
    // start modal
    this.initModal();
};

// Inicia validacao do login
myApp.c.initLogin = function () {
    if (this.appConfig.loginEnable) {
        var pageLogin = this.appConfig.pageLogin;
        this.posLogin = this.appConfig.indexPage;
        this.appConfig.indexPage = pageLogin + '.html';
        this.appConfig.pages.push(pageLogin);
       
        if (typeof this.appConfig.navbarHide == 'object') {
            this.appConfig.navbarHide.push(pageLogin);
        } else if (this.appConfig.navbarHide == false) {
            this.appConfig.navbarHide = [pageLogin];
        }
        
        if (typeof this.appConfig.toolbarHide == 'object') {
            this.appConfig.toolbarHide.push(pageLogin);
        } else if (this.appConfig.toolbarHide == false) {
            this.appConfig.toolbarHide = [pageLogin];
        }
        
        if (typeof this.appConfig.panelLeftHide == 'object') {
            this.appConfig.panelLeftHide.push(pageLogin);
        } else if (this.appConfig.panelLeftHide == false) {
            this.appConfig.panelLeftHide = [pageLogin];
        }
        
        if (typeof this.appConfig.panelRightHide == 'object') {
            this.appConfig.panelRightHide.push(pageLogin);
        } else if (this.appConfig.panelRightHide == false) {
            this.appConfig.panelRightHide = [pageLogin];
        }
        
        // afterLoadPageLogin
        myApp.c['afterLoadPage' + pageLogin] = function (pg) {
            $('.login-screen-title').attr('style','style="background: url(' + this.appConfig.appLogo + ') no-repeat left center"').html(this.appConfig.appName);
            $('.login-screen-subtitle').html(this.appConfig.appSlogan);
        }
        
        // logout
        $('.my-logout').on('click', function (){
            myApp.c.logout();
        })
    }
};

// logout app
myApp.c.logout = function () {
    myApp.c.clearLocalStorage();
    console.log(myApp.c.appConfig.pageLogin);
    myApp.c.go(myApp.c.appConfig.pageLogin + '.html');
    return;
}

// callback default Login
myApp.c.callbackLogin = function (a) {
    if(a !== false) {
        $.extend(a, {appLogado: true});
        myApp.c.setLocalStorage(a);
        myApp.c.appConfig.indexPage = myApp.c.posLogin;
        myApp.c.goIndex();
    } else {
        this.notification('error', 'Erro na autenticação, dados incorretos!');
    }
}

// Inicia a aplicacao (regras + redireciona para o index)
myApp.c.init = function () {
    this.initLogin();
    var pages = this.appConfig.pages;
    if (typeof pages === 'object') {
        var loadPage = new LoadPage();
        for (var i in pages) {
            this.initPage(pages[i], loadPage[pages[i]]);
        }
    }
    // redireciona para a pagina inicial do app
    this.go(this.appConfig.indexPage);
};

// Ajax na api global (appConfig.urlApi)
myApp.c.ajaxApi = function (method, params, callback) {
    var ajaxParams = {};
    ajaxParams.type = 'POST';
    ajaxParams.dataType = 'json';
    ajaxParams.data = (params || {});
    ajaxParams.url = this.appConfig.urlApi + method;
    ajaxParams.timeout = 7000;

    // verifica Preloader
    Preloader = $('.modal-overlay-visible').length;
    if (!Preloader) myApp.showPreloader(' ');
    
    var ajax = $.ajax(ajaxParams);
    ajax.always(function (jqXHR, textStatus, errorThrown) {		
        if (!Preloader) myApp.hidePreloader();
        if ((error = myApp.c.errorAjaxApi(jqXHR, textStatus, errorThrown))) {
            myApp.c.notification('error', error);
        } else if (typeof callback == 'function') {
            callback(jqXHR);
        }
    });
};

// error Ajax
myApp.c.errorAjaxApi = function (jqXHR, textStatus, errorThrown) {
    var errorStr = '';
    switch (textStatus) {
        case 'timeout':
            errorStr = 'O tempo limite de conexão foi atingido.';
            break;
        case 'error':			
			errorStr = '[' + jqXHR.status + '] Tente novamente mais tarde.';
            break;
        default:
            if ((typeofError = typeof jqXHR.error) != 'undefined') {
                if (typeofError == 'object') {
                    for (var i in jqXHR.error) {
                        erroC = (typeof jqXHR.error[i] === 'string' ? jqXHR.error[i] : jqXHR.error[i][0]);
                        if (erroC) {
                            errorStr += '&bull; ' + erroC + '<br />'; 
                        }
                    }
                } else {
                    errorStr += '&bull; ' + String(jqXHR.error);
                }
            }
            break;
    }
    return errorStr;
};

// inicializa calendarios da pagina class: calendar, calendar-multiple, calendar-range
myApp.c.initCalendar = function () {
    this.calendar = {};
    var objCalendar = {},
        paramCalendar = {},
        paramCalendarDefault = {
            dateFormat: 'dd/mm/yyyy',
            multiple: false,
            rangePicker: false,
            monthNames: Util.getMonthNames(),
            monthNamesShort: Util.getMonthNamesShort(),
            dayNames: Util.getDayNames(),
            dayNamesShort: Util.getDayNamesShort()
        };
    // para calendario padrao (seleciona uma data)
    objCalendar = $$('input[type=text].calendar');
    for (var i = 0; i < objCalendar.length; i++) {
        this.calendar[objCalendar[i].id] = myApp.calendar($.extend(paramCalendar, paramCalendarDefault, {input: '#' + objCalendar[i].id}));
    }
    // para calendario selecao multipla (seleciona varias datas)
    paramCalendar = {};
    objCalendar = $$('input[type=text].calendar-multiple');
    for (var i = 0; i < objCalendar.length; i++) {
        this.calendar[objCalendar[i].id] = myApp.calendar($.extend(paramCalendar, paramCalendarDefault, {input: '#' + objCalendar[i].id, multiple: true}));
    }
    // para calendario com selecao de periodo (data inicio e fim)
    paramCalendar = {};
    objCalendar = $$('input[type=text].calendar-range');
    for (var i = 0; i < objCalendar.length; i++) {
        this.calendar[objCalendar[i].id] = myApp.calendar($.extend(paramCalendar, paramCalendarDefault, {input: '#' + objCalendar[i].id, rangePicker: true}));
    }
};

// inicializa money da pagina class: money
myApp.c.initMoney = function () {
    this.money = {};
    var objMoney = $$('input.money');
    for (var i = 0; i < objMoney.length; i++) {
         $(objMoney[i]).maskMoney({thousands:'.', decimal:',', allowZero: true});
         this.money[objMoney[i].id];
    }
}

/*
 * Criar listView
 * action:  url do ajax
 * param:   data do ajax
 * target:  nome do template (é necessário criar o template.html templates/list/seuTarget.html) 
 *          tbm é o do destino/alvo da lista <div class="list-block" id="seuTarget"
 * callback:    callback ajax
 * search:  busca na listview
 */
myApp.c.listView = function (action, param, target, callback, search = true, infiniteScroll = true) {
    var objTarget = $('div#' + target);
	this.appConfig.infineteScrollEnable = infiniteScroll;
    if (objTarget.length == 0) {
        console.warn('[myApp.c.listView] O target informado não foi encontrado, é necessário criar uma  <div> com id="' + target + '".');
        return;
    }
    objTarget.append('<ul class="template-list" id="target-' + target + '">');
    var TemplateListView = new Template(target);
    TemplateListView.compileList(action, param, function (a) {
        if (search) myApp.c.createSearchList();
        if (myApp.c.appConfig.infineteScrollEnable) myApp.c.infiniteScroll(objTarget, TemplateListView, a);
        if (typeof callback == 'function') callback(a);
    });
};

// cria searchlist
myApp.c.createSearchList = function () {
    var numObj = $('div.page-on-center .page-content').length - 1;
    // verifica se ja foi criado
    if (!$('div.page-on-center').find('.searchbar-' + numObj).length) {
        var searchBar = '\
                <form class="searchbar searchbar-' + numObj + '">\n\
                    <div class="searchbar-input">\n\
                        <input type="search" placeholder="buscar">\n\
                        <a href="#" class="searchbar-clear"></a>\n\
                    </div>\n\
                    <a href="#" class="searchbar-cancel">Cancelar</a>\n\
                </form>\n\
                <div class="searchbar-overlay"></div>',
            notFound = '\
                <div class="content-block searchbar-not-found">\n\
                   <div class="content-block-inner">Nenhum registro encontrado.</div>\n\
                </div>',
            objHtml = $($('div.page-on-center .page-content')[numObj]);
        
        objHtml.before(searchBar);
        objHtml.find('.list-block').addClass('list-block-search searchbar-found').before(notFound);
        searchbar = myApp.searchbar('.searchbar-' + numObj, {
            searchList: '.list-block-search',
            searchIn: '.item-title',
            onSearch: function(a){}
        });
    }
};

// init modal
myApp.c.initModal = function () {
    this.modal = {};
    var modal = $('div.my-modal');
    var qtdModal = modal.length;
    for (var i = 0; i < qtdModal; i++) {
        idModal = $(modal[i]).attr('id');        
        this.modal[idModal] = myApp.modal({title:''});
        myApp.closeModal(this.modal[idModal]);
        modalInner = $(this.modal[idModal]).find('div.modal-inner');
        modalInner.append(modal[i]);
        $(modal[i]).css('display', 'block');
        t = parseInt(modalInner.css('height'));
        modalInner.parent('div.modal-in').css('margin-top', String(parseInt(((t/2)+15)*-1)) + 'px');
        // fechar modal
        $('.close-' + idModal).on('click', function () {
            myApp.c.closeModal(idModal);
        });
    }    
};

myApp.c.openModal = function (modalName) {
    myApp.openModal(this.modal[modalName]);
};

myApp.c.closeModal = function (modalName) {
    myApp.closeModal(this.modal[modalName]);
};

// cria infiniteScroll
myApp.c.infiniteScroll = function (objTarget, TemplateListView, data) {
    
    // verifica se é um array ou object
    var dataArray = data instanceof Array;
    var newObjectList;

    // add class infinite-scroll
    var objList = $($('.infinite-scroll')[$('.infinite-scroll').length - 1]);
    var objListBlock = objTarget;
    var objListLi = objListBlock.find('li');
    var objListUl = objListBlock.find('ul');
    var preloaderHtml = '\n\
        <div class="infinite-scroll-preloader">\n\
            <div class="preloader"></div>\n\
        </div>';
    
    // Attach preloader
    objListBlock.append(preloaderHtml);

    // Loading flag
    var loading = false;

    // Last loaded index
    var lastIndex = objListLi.length;

    // Max items to load
    var maxItems = Object.keys(data).length;

    // Append items per load
    var itemsPerLoad = this.appConfig.infineteScrollQtd;
    
    // Attach 'infinite' event handler
    objList.on('infinite', function () {
		
		$$('.infinite-scroll-preloader').show();
		
        // Exit, if loading in progress
        if (loading)  return;

        // Set loading flag
        loading = true;

        // Emulate 0,5s loading
        setTimeout(function () {

            // Reset loading flag
            loading = false;

            if (lastIndex >= maxItems) {
				// Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
				myApp.detachInfiniteScroll(objList);
				// Remove preloader
				$$('.infinite-scroll-preloader').remove();
				return;
            }

            // Generate new object
            newObjectList = dataArray ? [] : {};
            for (var i = lastIndex; i < lastIndex + itemsPerLoad; i++) {
                if (maxItems <= i) break;
                if (dataArray) {
                    newObjectList.push(data[i]);
                } else {
                    k = Object.keys(data)[i];
                    newObjectList[k] = data[k];
                }
            }
            
            // Conpile and Append new items
            TemplateListView.compileData(newObjectList);
            TemplateListView.appendData();

            // Update last loaded index
            lastIndex = objListBlock.find('li').length;
			
			$$('.infinite-scroll-preloader').hide();
			
        }, 500);
        
    });
    
    objList.trigger('infinite');
    
};

/*
 Util - Lista de metodos auxiliares
 */
var Util = $.extend((Util || {}), {

    // primeira letra da string maiuscula resto minusculo
    ucfirst: function (str) {
        return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
    },

    // meses do ano - 0: Janeiro
    getMonthNames: function (a) {
        var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return a ? meses[a] : meses;
    },

    // meses do ano (CURTO) - 0: Janeiro
    getMonthNamesShort: function (a) {
        var meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return a ? meses[a] : meses;
    },

    // dias da semana - 0: Domingo
    getDayNames: function (a) {
        var dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return a ? dias[a] : dias;
    },

    // dias da semana (CURTO) - 0: Domingo
    getDayNamesShort: function (a) {
        var dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return a ? dias[a] : dias;
    }
});