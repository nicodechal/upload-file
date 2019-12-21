window.onload = () => {
  const code = document.querySelector('.code');
  const data = document.querySelector('.data');
  const progressBar = document.querySelector('.item-progress-bar');
  const uploadFile = document.querySelector('.upload-file');
  const itemName = document.querySelector('.item-name');
  const itemData = document.querySelector('.item-data');
  const progressValue = document.querySelector('.item-progress-value');
  const uploadBtn = document.querySelector('.upload-btn');
  const selectBtn = document.querySelector('.select-file');
  const form = document.querySelector('.upload-form');

  const Progress = {
    setPercent(cur, total) {
      const percent = (100 * cur / total | 0) + '%';
      progressBar.style.width = progressValue.innerText = percent;
    },
    setDone() {
      progressValue.innerText = 'Done.';
      progressValue.classList.add('item-progress-value-done');
      progressBar.style.width = '0';
    }
  };

  selectBtn.addEventListener('click', () => {
    form.querySelector('input[type="file"]').click();
  });

  uploadFile.onchange = () => {
    const { name, size, lastModified } = uploadFile.files[0];
    itemName.innerText = name;
    itemData.innerText = formatBytes(size) + ' | ' + formatDate(lastModified);
  };

  uploadBtn.onclick = () => {
    
    ajax('/upload', {
      method: 'POST',
      data: new FormData(form),
      onprogress(e) {
        Progress.setPercent(e.loaded, e.total);
      }
    }).then(v => {
      const {code: c, data: d} = JSON.parse(v);
      if (c == 200) {
        Progress.setDone();
      }
      code.innerText = c;
      data.innerText = d.url;
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