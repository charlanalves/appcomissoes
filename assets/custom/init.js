/* CONFIG */
myApp.c.setAppConfig({
    appLogo: './assets/img/logo.png',
    appName: 'Estalecas',
    appSlogan: 'comissão',
    pages: ['main','vendas','extrato','senha'],
    indexPage: 'main.html',
    urlApi: 'http://localhost/cashback/frontend/web/index.php?r=api-comissao/',
    urlImg: 'http://localhost/cashback/frontend/web/img/',
    urlApi: 'http://localhost/apiestalecas/frontend/web/index.php?r=api-comissao/',
    urlImg: 'http://localhost/apiestalecas/frontend/web/img/',
    urlApi: 'http://estalecas.com.br/api/frontend/web/index.php?r=api-comissao/',
    urlImg: 'http://estalecas.com.br/api/frontend/web/img/',
    urlApi: 'http://localhost/cashback/frontend/web/index.php?r=api-comissao/',
    urlImg: 'http://localhost/cashback/frontend/web/img/',
});
myApp.c.setPanelLeft([
    {href: 'main.html', label: 'Saldo atual', ico: 'usd'},
    {href: 'vendas.html', label: 'Vendas', ico: 'shopping-cart'},
    {href: 'extrato.html', label: 'Extrato', ico: 'list'},
    {href: 'senha.html', label: 'Alterar senha', ico: 'key'},
    {label: 'Sair', ico: 'close', class: 'my-logout'}
    ]);
myApp.c.setToolbar([
    {href: 'main.html', label: 'Saldo atual', ico: 'usd'},
    {href: 'vendas.html', label: 'Vendas', ico: 'shopping-cart'},
    {href: 'extrato.html', label: 'Extrato', ico: 'list'},
    ]);
myApp.c.setToolbar([
    {href: 'main.html', label: 'Saldo atual', ico: 'usd'},
    {href: 'vendas.html', label: 'Vendas', ico: 'shopping-cart'},
    {href: 'extrato.html', label: 'Extrato', ico: 'list'},
    ]);
myApp.c.afterLoadPageGlobal = function(pg){
    // VERIFICA PRIMEIRO ACESSO
    var locaStorage = this.getLocalStorage();
    if(!locaStorage.email_valid && pg.name != 'senha' && pg.name != 'login') {
        var notificationWithButton = myApp.addNotification({
          title: '<i class="fa fa-info-circle"></i> Primeiro acesso',
          subtitle: 'É necessário alterar a senha.',
          closeButton: true,
        });
        this.go('senha.html');
    }
}
/* CONFIG */

/* INIT */
myApp.c.init();
