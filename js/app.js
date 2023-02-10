document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');
  
  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');
  
  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckBox = document.createElement('input');

  
  function getInvitados(){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/invitados');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        const invitados = JSON.parse(xhr.responseText);
        invitados.forEach(invitado => {
          const li = createLI(invitado.id, invitado.nombre,invitado.confirmado);
          ul.appendChild(li);
        });
      }
    };  
    xhr.send();
  }
  getInvitados();
  
  filterLabel.textContent = "Ocultar los que no hayan respondido";
  filterCheckBox.type = 'checkbox';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckBox);
  mainDiv.insertBefore(div, ul);
  filterCheckBox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if(isChecked) {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';  
        } else {
          li.style.display = 'none';                        
        }
      }
    } else {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        li.style.display = '';
      }                                 
    }
  });

  
  function createLI(id,text,confirmado) {

    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);  
      element[property] = value; 
      return element;
    }
    
    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);     
      li.appendChild(element); 
      return element;
    }
    
    const li = document.createElement('li');
    li.setAttribute("id", id);
    li.setAttribute("nombre", text);
    li.setAttribute("confirmado", confirmado);
    appendToLI('span', 'textContent', text);     
    const checkbox = appendToLI('label', 'textContent', 'Confirmed')
      .appendChild(createElement('input', 'type', 'checkbox'));
      if (confirmado) {
        checkbox.checked = true;
        li.className = 'responded';
      }else{
        checkbox.checked = false;
        li.className = '';
      }
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');

    return li;
  }
  
  form.addEventListener('submit', (e) => {
    function addInvitado(nombre,confirmado) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3000/invitados');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 201) {
          const invitado = JSON.parse(xhr.responseText);
          const li = createLI(invitado.id, nombre,false);
          ul.appendChild(li);
          console.log('Invitado añadido');
        }
      };
      xhr.send(JSON.stringify({ nombre, confirmado}));
    }
    
    e.preventDefault();
    const text = input.value;
    input.value = ''; 
    addInvitado(text,false);
  });
    
  ul.addEventListener('change', (e) => {
    const checkbox = e.target;
    const checked = checkbox.checked;
    const listItem = checkbox.parentNode.parentNode;
    const id= listItem.getAttribute("id");
    
    if(e.target.type=="checkbox"){
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `http://localhost:3000/invitados/${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log('Invitado actualizado');
      }
    };
    const nombre= listItem.getAttribute("nombre");
    if (checked) {
      listItem.className = 'responded';
      xhr.send(JSON.stringify({ nombre, confirmado: true }));
    } else {
      listItem.className = '';
      xhr.send(JSON.stringify({ nombre, confirmado: false }));
    }
  }
  });
    
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      console.log(li);
      const id= li.getAttribute("id");
      const confir= li.getAttribute("confirmado");
      const boolconfir= JSON.parse(confir);
      const ul = li.parentNode;
      const action = button.textContent;
      const nameActions = {
        remove: () => {
          function deleteInvitado(id) {
            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', `http://localhost:3000/invitados/${id}`,true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
              if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                console.log('Invitado eliminado');
              }
            };
            xhr.send();
          }
          ul.removeChild(li);
          deleteInvitado(id);
        },
        edit: () => {
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'save';  
        },
        save: () => {
          function updateInvitado(id, nombre) {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', `http://localhost:3000/invitados/${id}`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
              if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                console.log('Invitado actualizado');
              }
            };
            xhr.send(JSON.stringify({ nombre, confirmado: boolconfir }));
          }

          const input = li.firstElementChild;
          const span = document.createElement('span');
          span.textContent = input.value;
          li.insertBefore(span, input);
          li.removeChild(input);
          button.textContent = 'edit';    
          updateInvitado(id,input.value);    
        }
      };
      
      // select and run action in button's name
      nameActions[action]();
    }
  });  
});  
