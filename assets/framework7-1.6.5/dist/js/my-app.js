// Initialize app
var myApp = new Framework7({
    swipeBackPage: false,
    pushState: true,
    swipePanel: 'both',
    modalTitle: 'Title',
    cache: true,
});

// Para os metodos personalizados (custom)
myApp.c = {};

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});



$$(document).on('pageAfterAnimation', function (e) {
	
});





// configuracoes iniciais do app
myApp.c.appConfig = {

    url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',	
	//  url: 'http://localhost/apiestalecas/frontend/web/index.php?r=',
    
    urlFoto: 'http://52.67.208.141/cashbackdev/frontend/web/',	
	//	urlFoto: 'http://localhost/apiestalecas/frontend/web/',
    //urlFoto: 'http://localhost/cashback/frontend/web/',
    
    //url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',
    //url: 'http://localhost/apiestalecas/frontend/web/index.php?r=',
    //urlFoto: 'http://localhost/apiestalecas/frontend/web/',
    
    // Eduardo
    //urlFoto: 'http://localhost/cashback/frontend/web/',
    indicacaoUrl:'http://52.67.208.141/cashbackdev/indicacao/register.php?auth_key=',
    localStorageName: 'esUser',
    back: false,
    backRecarregou: true,
    actionInit: false,
	
	
	
	
	
	// URL utilizados nas requisicoes ajax
    urlApi: 'http://localhost/cashback/frontend/web/index.php?r=api-controller/',

	// lista com todas as paginas acessiveis do sistema
	pages: ['about', 'form'],
	
	// pagina inicial
	indexPage: 'about',
	
	// se nao for utilizar os atributos a baixo passe false
	navbarHide: false, 
	panelLeftHide: false, 
	panelRightHide: [],
	toolbarHide: ['about'],
};


// set configuracoes iniciais do app
myApp.c.setAppConfig = function (param) {
	$.extend(this.appConfig, param);
};

// habilita/desabilita o painel lateral (direction = "Left"/"Right", pgName = "nome-da-pagina")
myApp.c.panelHide = function (direction, pgName) {
	// Primeira letra maiuscula restante minusculo
	var directionU = Util.ucfirst(direction);
	// existe permissao para esconder o panel da pagina
	var pemissionExist = ($.inArray(pgName, this.appConfig['panel' + directionU + 'Hide']) !== -1);
	if (myApp.params.swipePanel == 'both' && pemissionExist) {
		myApp.params.swipePanel = (directionU == 'Right' ? 'left' : 'right');
	} else if (myApp.params.swipePanel == direction && pemissionExist) {
		myApp.params.swipePanel = false;
	} else if (myApp.params.swipePanel != direction && !pemissionExist) {
		myApp.params.swipePanel = 'both';
	} else {
		myApp.params.swipePanel = direction;
	}	
};

// Set Panel (menu lateral) - itens = [{href:'', class:'', label:''}]
myApp.c.createHtmlPanel = function(itens, title) {
	var codHtml = '<div class="content-block">';
	codHtml += (title) ? '<p>' + title + '</p>' : '';
	for (var i in itens){
		codHtml += '<p><a href="./pages/' + itens[i].href + '" class="close-panel ' + itens[i].class + '">' + itens[i].label + '</a></p>';
	}
	codHtml += '</div>';
	return codHtml;
};

myApp.c.setPanel = function(panel, itens, title = '', replace = true) {
	var htmlPanel = myApp.c.createHtmlPanel(itens, title),
		panel = $('div.panel-' + panel);
	if(replace) {
		panel.html(htmlPanel);
	} else {
		panel.append(htmlPanel);
	}
};

// setPanelLeft
myApp.c.setPanelLeft = function(itens, title, replace) {
	myApp.c.setPanel('left', itens, title, replace);
};

// setPanelRight
myApp.c.setPanelRight = function(itens, title, replace) {
	myApp.c.setPanel('right', itens, title, replace);
};

// exibe/esconde navbar (barra superior)
myApp.c.navbarHide = function (pgName) {
	if($.inArray(pgName, myApp.c.appConfig.navbarHide) === -1) {
		myApp.showNavbar('.navbar', true);
	} else {
		myApp.hideNavbar('.navbar', true);
	}
};

// exibe/esconde toolbar (barra inferior)
myApp.c.toolbarHide = function (pgName) {
	if($.inArray(pgName, myApp.c.appConfig.toolbarHide) === -1) {
		mainView.showToolbar();
	} else {
        tabbarBottom = $('div#toolbar-bottom');
		tabbarBottom.find('.link-toolbar-bottom').removeClass('active');
		tabbarBottom.find('.link-toolbar-bottom.active-' + pgName).addClass('active');
	    mainView.hideToolbar();
	}
};

// Set Toolbar (menu inferior) - itens = [{href:'', class:'', label:'', ico:''}]
myApp.c.setToolbar = function(itens) {
	var codHtml = '<div class="toolbar-inner">';
	for (var i in itens){
		codHtml += '<a href="./pages/' + itens[i].href + '" class="link link-tabbar-bottom ' + itens[i].class + '">';
		codHtml += '<i class="fa fa-' + itens[i].ico + '" aria-hidden="true"></i><span class="tabbar-label">' + itens[i].label + '</span>';
		codHtml += '</a>';
	}
	codHtml += '</div>';
	toolbar = $('div#toolbar-bottom').html(codHtml);
};

// loadPage - carrega pagina na view principal
myApp.c.go = function (pgName, ext = 'html') {
	if($.inArray(pgName, this.appConfig.pages) === -1) {
		console.info('Pagina nao registrada, adicione-a em: myApp.c.appConfig.pages');
	} else {
		mainView.router.loadPage('pages/' + pgName + '.' + ext);
	}
};

// para todas as paginas passarem por essas regras
myApp.c.initPage = function (page, callback) {
    var page,
		callback = (typeof callback == 'function') ? callback : function(){};
    
    // evento antes da animacao da page
    myApp.onPageBeforeAnimation(page, function (pg) {
        
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
	
    });
    
    // evento apos a animacao da page
    myApp.onPageAfterAnimation(page, function (pg) {
	
		// calback do load
		callback(pg);
		
    });
};

// Inicia a aplicacao (regras + redireciona para o index)
myApp.c.init = function () {
	var pages = this.appConfig.pages;
	if(typeof pages === 'object') {
		for (var i in pages) {
			this.initPage(pages[i], this['load' + Util.ucfirst(pages[i])]);
		}
	}
	myApp.c.go(this.appConfig.indexPage);	
};

// Ajax na api global (appConfig.urlApi)
myApp.c.ajaxApi = function (method, params, callback) {
    var ajaxParams = {};
    ajaxParams.type = 'POST';
    ajaxParams.dataType = 'json';
    ajaxParams.data = (params || {});
    ajaxParams.url = appConfig.urlApi + method;

	myApp.showPreloader(' ');
    var ajax = $.ajax(ajaxParams);
    ajax.always(function (data) {
		myApp.hidePreloader();
        if (typeof data.error != "undefined" && data.error) {
            var errorStr = '';
            for (var i in data.error) {
                errorStr += "* " + data.error[i][0] + "<br />";
            }
            myApp.alert(errorStr, 'Opss');
        } else if ( typeof callback == 'function' ) {
            callback(data);
        }
    });
};


/*
	Util - Lista de metodos auxiliares
*/
var Util = {
	// primeira letra da string maiuscula resto minusculo
	ucfirst: function (str) {
		return str.substr(0,1).toUpperCase()+str.substr(1).toLowerCase();
	}
}