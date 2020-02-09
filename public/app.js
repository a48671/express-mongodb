const toCurrency = function(price) {
    return new Intl.NumberFormat('ru-RU', {
        currency: 'rub',
        style: 'currency'
    }).format(price);
};

const toDate = function(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date));
};

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent);
});

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent);
})

const cardList = document.querySelector('.card__list');

if (cardList) {
    cardList.addEventListener('click', event => {
        if (event.target.classList.contains('js-card-delete-course')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;
            fetch(`/card/remove/${id}`, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            })
                .then(res => res.json())
                .then(card => renderCard(card))
                .catch(err => console.error(new Error(err)));
        }
    })
}

const renderCard = function (card) {
    if (card.courses.length) {
        const html = card.courses.map(item => `
            <div class="card__item">
                <img src="${item.image}" alt="${item.title}" class="card__img">
                <h3 class="card__title">${item.title}</h3>
                <p class="card__count">${item.count} шт.</p>
                <p class="price count__price">${item.price}</p>
                <button class="btn btm-small js-card-delete-course" data-id="${item.id}">Delete</button>
            </div>
        `).join('');
        cardList.innerHTML = html;
        document.querySelector('.card__total').innerHTML = toCurrency(card.total);
    } else {
        document.querySelector('.card__wrapper').innerHTML = '<p>Card empty</p>';
    }
};

const instance = M.Tabs.init(document.querySelectorAll('.tabs'));