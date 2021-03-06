import * as $ from 'jquery';
import * as tags from '../resource/tags.json';

export const addListenersToReviews = () => {
    let reviews = $('.reviews');
    reviews.bind('DOMNodeInserted', (event) => {
        let target = event && event.target;
        let isReview = target.classList.contains('review');
        if (!isReview) {
            return;
        }

        addEventListenerToReview($(target));
    });

    reviews.children().each((number, element) => addEventListenerToReview($(element)));
};

const addEventListenerToReview = (review: JQuery<HTMLElement>) => {
    let handleClick = (event: any) => {
        review.off('click', handleClick);
        clickAddTagButton(event.currentTarget);

        if ($(event.currentTarget).find('.tag-selection').length) {
            return;
        }

        let tagSelection = $('<div class=\'tag-selection\'/>');

        loadAndApplyTags(tagSelection);

        let reviewDetails = $(event.currentTarget).find('.review__content .tags');
        reviewDetails.after(tagSelection);

        let tagBar = review.find('.tags');

        tagBar.find("div:first-child > span").each((index, element) => selectTag(review, $(element).text()));

        addEventListenerToTagBar(tagBar);
    };

    review.on('click', handleClick);
};

const addEventListenerToTagBar = (tagBar: JQuery<HTMLElement>) => {
    const handleTagRemove = (event: any) => {
        let target = $(event.target);
        let isTag = !!target.parent(".tags div:first-child").length;

        if (!isTag) {
            return;
        }

        let tag = target,
            label = tag.text(),
            review = tag.closest('.review');

        deselectTag(review, label);
    };

    tagBar.bind('DOMNodeRemoved', handleTagRemove);
};

const createTag = (label: string) => {
    let tag = $('<li class=\'tag\'></li>');
    tag.text(label);
    tag.bind('click', (event) => {
        event && event.preventDefault();

        if (tag.hasClass('selected')) {
            return;
        }

        let review = tag.closest('.review');
        addTag(review, label);
        tag.addClass('selected');
    });

    return tag;
};

const addTag = (review: JQuery<HTMLElement>, label: string) => {
    clickAddTagButton(review);

    let currentReview = review.get(0);
    let tagInput: HTMLInputElement | null = currentReview && currentReview.querySelector('.tags__field label input[type=\'text\']');

    if (!tagInput) {
        return;
    }
    let propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    let nativeInputValueSetter = propertyDescriptor && propertyDescriptor.set;
    nativeInputValueSetter && nativeInputValueSetter.call(tagInput, label);

    let inputEvent = new Event('input', {bubbles: true});
    tagInput && tagInput.dispatchEvent(inputEvent);

    let tagButton = review.find('.tags__field label button');
    tagButton.trigger('click');
};

const findTagByLabel = (review: JQuery<HTMLElement>, label: string) => {
    let tag = review
        .find(`.tag-selection .tag`)
        .toArray()
        .find((element) => element.innerText === label);
    return tag ? $(tag) : $();
};

const selectTag = (review: JQuery<HTMLElement>, label: string) => {
    let tag = findTagByLabel(review, label);
    tag.addClass('selected');
};

const deselectTag = (review: JQuery<HTMLElement>, label: string) => {
    let tag = findTagByLabel(review, label);
    tag.removeClass('selected');
};

const clickAddTagButton = (parent: HTMLElement | EventTarget | JQuery<HTMLElement>) => {
    let button = $(parent).find('.tags__button');
    button.trigger('click');
};

const loadAndApplyTags = (tagSelection: JQuery<HTMLElement>) => {
    let categories = tags.categories;
    categories.forEach((category) => {
        let categoryEl = $('<div class=\'category\'/>');
        categoryEl.append(`<div class='name'>${category.name}</div>`);

        let lists = category.tagGroups.map((tagGroup) => {
            let tagList = $('<ul class=\'tag-list\'/>');
            let tags = tagGroup.map((tag) => createTag(tag));
            tagList.append(tags);
            return tagList;
        });

        categoryEl.append(lists);

        tagSelection.append(categoryEl);
    });
};