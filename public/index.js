window.onload = () => {
  const state = document.querySelector('.state');

  const fileList = document.querySelector('.file-list');

  const progressBar = document.querySelector('.item-progress-bar');
  const progressValue = document.querySelector('.item-progress-value');

  const uploadBtn = document.querySelector('.upload-btn');
  const selectBtn = document.querySelector('.select-file');
  const form = document.querySelector('.upload-form');

  const Progress = {
    setPercent(cur, total) {
      const percent = (100 * cur / total | 0) + '%';
      progressBar.style.width = progressValue.textContent = percent;
    },
    setDone() {
      progressValue.textContent = 'Done.';
      progressValue.classList.add('item-progress-value-done');
      progressBar.style.background = '#07d20940';
    }
  };

  selectBtn.addEventListener('click', () => {
    const inputFile = document.createElement('input');
    inputFile.name = 'file';
    inputFile.type = 'file';
    inputFile.classList.add('upload-file');

    form.appendChild(inputFile);

    inputFile.onchange = () => {
      const { name, size, lastModified } = inputFile.files[0];
      const fileItem = generateNodeByTemp('.file-item-template', {
        '.item-name': name,
        '.item-data': formatBytes(size) + ' | ' + formatDate(lastModified)
      });
      fileList.appendChild(fileItem);
    };

    inputFile.click();
  });

  uploadBtn.onclick = () => {
    
    ajax('/upload', {
      method: 'POST',
      data: new FormData(form),
      onprogress(e) {
        Progress.setPercent(e.loaded, e.total);
      }
    }).then(v => {
      const json = JSON.parse(v);
      if (json.code == 200) {
        Progress.setDone();
      }
      state.textContent = json.data.urls;
    }).catch(e => {
      console.log(e);
    });
  };


  function formatDate(date) {
    date = new Date(date);
    return date.toISOString().substr(0, 10) + ' ' + date.toISOString().substr(11, 8);
  }

  function formatBytes(b) {
    const suffix = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (b > 1024 && i < 4) {
      b /= 1024;
      i++;
    }
    return b.toFixed(2) + suffix[i];
  }
};


function ajax (url, { method = 'GET', async = true, data = '', onprogress = () => {} }) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        res(xhr.responseText);
      }
    };
    xhr.onerror = e => {
      rej(e);
    };
    xhr.upload.onprogress = e => onprogress.call(this, e);
    xhr.open(method, url, async);
    xhr.send(data);
  });
}

function generateNodeByTemp(tmpCls, data) {
  const tmp = document.querySelector(tmpCls);
  const clone = document.importNode(tmp.content, true);
  for (const k of Object.keys(data)) {
    clone.querySelector(k).textContent = data[k];
  }
  return clone;
}