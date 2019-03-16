function jaLogou(){
    let sessionId = localStorage.getItem('session_id')
    let dataExpiracao = localStorage.getItem('data_expiracao')
    return sessionId != undefined 
        && dataExpiracao != undefined 
        && (new Date(dataExpiracao).getTime()) > (new Date().getTime())
}

function removeSession(){
    localStorage.removeItem('session_id')
    // TODO: Conectar com servidor e enviar os parametros logout e session_id
    atualizarComponentesTela()
}

function atualizarComponentesTela(){
    if ( jaLogou() ){
        
        $('#modalContaToggle').addClass('desativado')
        $('#menuUsuarioToggle').removeClass('desativado')
        $('.container').css('margin-top', '70px')

        let token = sessionStorage.getItem('token')
        if ( token ){
            let fotoPerfilSrc = sessionStorage.getItem('imagem') 
            $('#menuUsuarioToggle').attr('src', fotoPerfilSrc)
        }
        else {
            // TODO: Enviar session_id como POST
            fetch('backend.json').then( (response) => {
                response.json().then( (json) => {
                    sessionStorage.setItem('imagem', json.imagem)
                    sessionStorage.setItem('email', json.email)
                    sessionStorage.setItem('nome', json.nome)
                    sessionStorage.setItem('token', true)
                    localStorage.setItem('data_expiracao', json.data_expiracao)
                    $('#modalLoginSignUp').modal('hide')
                    // TODO: Atualizar componentes nessecarios
                    let fotoPerfilSrc = sessionStorage.getItem('imagem') 
                    let nomeUsuario = sessionStorage.getItem('nome') 
                    let emailUsuario = sessionStorage.getItem('email')
                    $('#menuUsuarioToggle').attr('src', fotoPerfilSrc)
                })
            })
        }
    }
    else{ // não tenho session_id, etc.
        $('#menuUsuarioToggle').addClass('desativado')
        $('#modalContaToggle').removeClass('desativado')
        $('.container').css('margin-top', '120px')
        $('.card').removeClass('meusEventos')
        $('.card').removeClass('desativado')
        $('.card button').removeClass('btn-danger')
        $('.card button').addClass('btn-success')
        $('.card button').html('Participar')
    }
}

/////// CHAMADA MAIN ////////////

atualizarComponentesTela()

////////////////////////////////

$('#modalUpdateToggle').click( () => {
    $('#modalAtualizarDados').modal()
    
    let emailUsuario = sessionStorage.getItem('email')
    let nomeUsuario = sessionStorage.getItem('nome') 

    $('#updateEmail').val(emailUsuario)
    $('#updateNome').val(nomeUsuario)
})

$('#modalUpdateSave').click( () => {
    // TODO: Enviar post para servidor com as alterações
})

$('#btnLogin').click(() => {
    let email = $('#loginEmail').val()
    let senha = $('#loginSenha').val()

    if ( email == '' || !email.includes('@') || senha == '' ){
        $('#alertaLoginSignUp').html('Os campos email e senha, são obrigatorio')
    }
    else{
        // TODO: Enviar usuario e senha como POST
        fetch('/backend.json').then( (resposta) => {
            switch(resposta.status){
                case 200:
                    resposta.json().then( (json) => {
                        localStorage.setItem('session_id', json.session_id)
                        localStorage.setItem('data_expiracao', json.data_expiracao)
                        $('#modalLoginSignUp').modal('hide')
                        atualizarComponentesTela()
                    }).catch( (erro) => {
                        $('#alertaLoginSignUp').html('Usuario ou senha não encontrado')
                        console.log(erro)
                    })
                    break
                case 404:
                    $('#alertaLoginSignUp').html('Erro 404, servidor não encontrado')
                    break
            }
        })
    }
})

$('#btnSignUp').click(() => {
    let email = $('#signUpEmail').val()
    let nome = $('#signUpNome').val()
    let senha = $('#signUpSenha').val()
    let senhaConfirm = $('#signUpSenhaConfirm').val()
    let imagem = $('#signUpImagem').val()
    
    if ( senha == senhaConfirm ){
        // TODO: Enviar dados de cadastro como POST
        fetch('backend.json').then( (response) => {
            response.json().then( (json) => {
                localStorage.setItem('data_expiracao', json.data_expiracao)
                localStorage.setItem('session_id', json.session_id)
                $('#modalLoginSignUp').modal('hide')
                atualizarComponentesTela()
            })
        })
    }
})

$('#btnLogout').click(() => {
    removeSession()
    atualizarComponentesTela()
})

$('#menuHamburger, #sidenav span').click(() => {
    $('#sidenav').toggleClass('aberto');
    $('#menuHamburger').toggleClass('aberto');
});

$('#meusEventosFilter').click(() => {
    if(jaLogou()){
        $('.card:not(.meusEventos)').addClass('desativado')
    }
    else{
        $('#modalLoginSignUp').modal()
    }
})

$('#todosEventosFilter').click(() => {
    $('.card').removeClass('desativado')
})

$('#detectAddressTrigger').click(() => {
    if (navigator.geolocation){
        // http://my.locationiq.com
        let apiKey = '0a87d1c25baef8'
        navigator.geolocation.getCurrentPosition((position) => {
            let url ='https://us1.locationiq.com/v1/reverse.php?key='
                    + apiKey 
                    + '&lat=' + position.coords.latitude 
                    + '&lon=' + position.coords.longitude 
                    + '&format=json'
            fetch(url).then((response) => {
                response.json().then((json) => {
                    if (json.address != undefined){
                        $('.enderecoRua').val(json.address.road)
                        $('.enderecoBairro').val(json.address.neighbourhood)
                        $('.enderecoCidade').val(json.address.city)
                        $('.enderecoEstado').val(json.address.state)
                    }
                })
            })
        }, () => { 
            $('#alertaDetecAdress').html('Erro ao detectar localização')
        },  { enableHighAccuracy: true })
    }
})

$('.card button').click(function () {
    if ( !jaLogou() ){
        $('#modalLoginSignUp').modal() // mostrar modal
    }
    else if ( $(this).closest('.card').hasClass('meusEventos') ){
        $(this).closest('.card').removeClass('meusEventos') // alternativa .parent()
        $(this).removeClass('btn-danger')
        $(this).addClass('btn-success')
        $(this).html('Participar')
    }
    else{
        $(this).closest('.card').addClass('meusEventos')
        $(this).removeClass('btn-success')
        $(this).addClass('btn-danger')
        $(this).html('Sair')
    }
})