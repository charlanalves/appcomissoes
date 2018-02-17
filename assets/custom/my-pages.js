class LoadPage {

    constructor() {
    }

    login(page) {
        var loginForm = new Form('login-form'),
            inputLogin = loginForm.form.find('input[name=cpf_cnpj]'),
            btnSubmit = loginForm.form.find('#btn-submit'),
            lnkEsqueceuSenha = loginForm.form.find('#linkEsqueceuSenha');

        btnSubmit.on('click', function() {
            myApp.c.ajaxApi('login', loginForm.getFormData(), myApp.c.callbackLogin);
        });

        lnkEsqueceuSenha.on('click', function () {
            var cpf_cnpj = inputLogin.val();
            if(!cpf_cnpj) {
                alert('Preencha o campo CPF/CNPJ e clique novamente no link para receber em seu e-mail uma nova senha.', 'Esqueceu a senha?'); 
            } else {
                myApp.c.ajaxApi('nova-senha', {cpf_cnpj}, function(r) {
                    if(r.status == null) {
                        alert('Sua conta não foi encontrada, verifique os dados informados e tente novamente.', 'Esqueceu a senha?');                     

                    } else if(r.status) {
                        alert('Foi enviado um e-mail para <strong>' + r.email + '</strong> com a nova senha!', 'Esqueceu a senha?');                     

                    } else {
                        alert('Não foi possível recuperar a senha, tente novamente.', 'Esqueceu a senha?');                     

                    }
                });
            }
        });
    }
    
    /*
    SALDO
     */
    main(page) {
        var locaStorage = myApp.c.getLocalStorage(),
            TemplateSaldo = new Template('templateSaldo');
        TemplateSaldo.compileAjax('saldo', locaStorage, function (a) {});
    }

    /*
    VENDAS
     */
    vendas(page) {
        var locaStorage = myApp.c.getLocalStorage();

        // listview vendas
        var findVendas = function() {
            var param = {
                empresa: document.getElementById('filtroVendas-empresa').value,
                periodo: document.getElementById('filtroVendas-periodo').value,
                auth_key: locaStorage.auth_key
            };
            myApp.c.listView ('vendas-list', param, 'vendasList', function (a) { 
                var vlr = $$('.list-vendas span.vlr-filter-real'), 
                    total = 0;
                for(var i = 0; i < vlr.length; i++) {
                    total = parseFloat($(vlr[i]).text()) + total;
                }
                $('div#total-filtro').html("Total: R$ " + Util.formatNumber(total));
            }, false, false);
        };

        // empresas + periodos
        var templateFiltroVendas = new Template('templateFiltroVendas');
        templateFiltroVendas.compileAjax('vendas-filter', locaStorage, function () {
            // carrega a lista apos gerar os filtros de empresa e periodo
            findVendas();
            // cria evento de clique no botao de busca de de vendas
            $('a#btn-filtrarVendas').on('click', function () {
                findVendas();
            });
        });
    }

    /*
    EXTRATO
     */
    extrato(page) {
        var locaStorage = myApp.c.getLocalStorage();

        // listview extrato
        var findExtrato = function() {
            var param = {
                periodo: document.getElementById('filtroExtrato-periodo').value,
                auth_key: locaStorage.auth_key
            };
            myApp.c.listView ('extrato-list', param, 'extratoList', function (a) { 
                var vlr = $$('.list-extrato span.vlr-filter-real'), 
                    total = 0;
                for(var i = 0; i < vlr.length; i++) {
                    total = parseFloat($(vlr[i]).text()) + total;
                }
                $('div#total-filtro').html("Total: R$ " + Util.formatNumber(total));
            }, false, false);
        };

        // periodos
        var templateFiltroExtrato = new Template('templateFiltroExtrato');
        templateFiltroExtrato.compileAjax('extrato-filter', {}, function () {
            // carrega a lista apos gerar os filtros de empresa e periodo
            findExtrato();
            // cria evento de clique no botao de busca de de vendas
            $('a#btn-filtrarExtrato').on('click', function () {
                findExtrato();
            });
        });
    }

    /*
    SENHA
    */
    senha(page) {
        var locaStorage = myApp.c.getLocalStorage(),
            passwordForm = new Form('changePassword-form'),
            currentPassword = passwordForm.form.find('input[name=current-password]'),
            newPassword = passwordForm.form.find('input[name=new-password]'),
            btnSubmit = passwordForm.form.find('#changePassword-submit');

        btnSubmit.on('click', function() {
            var param = {
                'auth_key': locaStorage.auth_key,
                'current-password': currentPassword.val(),
                'new-password': newPassword.val(),
            };

            if (param['current-password'] != '' && param['new-password'] != '') {
                myApp.c.ajaxApi('senha', param, function(a){
                    if(typeof a.message != 'undefined') {
                        passwordForm.clear();
                        alert(a.message, "ALTERAR SENHA");
                        myApp.c.setLocalStorage({email_valid:1});
                        myApp.c.goIndex();
                    }
                });

            } else {
                alert("Preencha todos os campos.", "ALTERAR SENHA");
            }
        });

    }

}