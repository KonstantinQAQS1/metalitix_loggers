import { sendMetricSurveysData } from '../services';
import { AddSurveyProps } from '../types';

const template = `<style>
  .mtx-survey {
    position: fixed;
    z-index: 2000;
    top: 0;
    left: 50%;
    transform: translate(-50%, -100%);
    padding: 10px 33px 7px;
    border-radius: 5px;
    border: 2px solid #888;
    transition: transform 0.3s ease-in-out;
  }

  .mtx-survey--open {
    transform: translate(-50%, 35px);
  }

  .mtx-survey--close {
    opacity: 0;
    transition: transform 0.3s cubic-bezier(0.84, -0.23, 0.41, 0.78), opacity 0.3s ease-in-out;
    transform: translate(-50%, 0) scale(0.6);
  }

  .mtx-survey--white {
    background: #fff;
    color: #292929;
  }

  .mtx-survey--black {
    background: #2d2d2d;
    color: #fff;
  }

  .mtx-survey-title {
    font-family: 'Rubik', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    margin: 0 0 5px;
    text-align: center;
  }

  .mtx-survey-items {
    text-align: center;
    padding-left: 2px;
    margin-bottom: 4px;
  }

  .mtx-survey-items svg {
    display: block;
  }

  .mtx-survey.selected .mtx-survey-item:not(.active) {
    opacity: 0.5;
  }

  .mtx-survey-item {
    transition: opacity 0.3s ease-in-out, filter 0.1s ease-in-out;
    cursor: pointer;
  }

  .mtx-survey-item:hover,
  .mtx-survey-item.active {
    opacity: 1;
    filter: drop-shadow(2px 3px 2px rgb(0 0 0 / 0.4));
  }

  .mtx-survey--black .mtx-survey-item:hover,
  .mtx-survey--black .mtx-survey-item.active {
    filter: drop-shadow(0px 0px 1px #2d2d2d) drop-shadow(2px 3px 2px rgb(255 255 255 / 0.5));
  }

  .mtx-survey-submit-holder {
    text-align: center;
  }

  .mtx-survey-submit-button {
    background: #ffffff;
    border: 0;
    font-family: 'Rubik', sans-serif;
    font-style: normal;
    font-weight: 300;
    font-size: 10px;
    line-height: 12px;
    padding: 7px 27px;
    border-radius: 5px;
    cursor: pointer;
  }

  .mtx-survey-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .mtx-survey--white .mtx-survey-submit-button {
    background: #292929;
    color: #fff;
  }

  .mtx-survey--black .mtx-survey-submit-button {
    background: #fff;
    color: #2f2f2f;
  }
</style>
<h4 class="mtx-survey-title">How would you rate your experience?</h4>
<div class="mtx-survey-items">
  <svg width="267" height="46" viewBox="0 0 267 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g class="mtx-survey-item" data-value="1">
      <path d="M19.2562 37.805C29.2646 37.805 37.3965 29.6731 37.3965 19.6647C37.3965 9.65626 29.2646 1.52441 19.2562 1.52441C9.24777 1.52441 1.11594 9.65626 1.11594 19.6647C1.11594 29.6731 9.24777 37.805 19.2562 37.805Z" fill="#E64355"/>
      <path d="M19.2564 2.64125C9.87348 2.64125 2.23313 10.2816 2.23313 19.6645C2.23313 29.0474 9.87348 36.6878 19.2564 36.6878C28.6393 36.6878 36.2796 29.0474 36.2796 19.6645C36.2796 10.2816 28.6393 2.64125 19.2564 2.64125ZM19.2564 0.407227C29.8903 0.407227 38.5137 9.03056 38.5137 19.6645C38.5137 30.2985 29.8903 38.9218 19.2564 38.9218C8.62242 38.9218 -0.000896454 30.2985 -0.000896454 19.6645C-0.000896454 9.03056 8.62242 0.407227 19.2564 0.407227Z" fill="#FBD2D8"/>
      <path d="M23.6645 16.6417C22.7597 16.6417 22.0262 15.5414 22.0262 14.1842C22.0262 12.827 22.7597 11.7268 23.6645 11.7268C24.5693 11.7268 25.3027 12.827 25.3027 14.1842C25.3027 15.5414 24.5693 16.6417 23.6645 16.6417Z" fill="white"/>
      <path d="M15.1 16.6417C14.1952 16.6417 13.4617 15.5414 13.4617 14.1842C13.4617 12.827 14.1952 11.7268 15.1 11.7268C16.0048 11.7268 16.7383 12.827 16.7383 14.1842C16.7383 15.5414 16.0048 16.6417 15.1 16.6417Z" fill="white"/>
      <path d="M9.96176 28.2436C9.96176 28.2436 11.7639 21.5713 19.0021 21.5713C25.734 21.5713 28.5488 28.2436 28.5488 28.2436" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    </g>
   
    <g class="mtx-survey-item" data-value="2">
      <path d="M75.7699 37.8047C85.7783 37.8047 93.9102 29.6729 93.9102 19.6644C93.9102 9.65602 85.7783 1.52417 75.7699 1.52417C65.7615 1.52417 57.6296 9.65602 57.6296 19.6644C57.6296 29.6729 65.7615 37.8047 75.7699 37.8047Z" fill="#F5A720"/>
      <path d="M75.7701 2.64125C66.3872 2.64125 58.7468 10.2816 58.7468 19.6645C58.7468 29.0474 66.3872 36.6878 75.7701 36.6878C85.153 36.6878 92.7933 29.0474 92.7933 19.6645C92.7933 10.2816 85.153 2.64125 75.7701 2.64125ZM75.7701 0.407227C86.404 0.407227 95.0273 9.03056 95.0273 19.6645C95.0273 30.2985 86.404 38.9218 75.7701 38.9218C65.1361 38.9218 56.5128 30.2985 56.5128 19.6645C56.5128 9.03056 65.1361 0.407227 75.7701 0.407227Z" fill="#FFE6BE"/>
      <path d="M80.0609 16.6413C79.1561 16.6413 78.4227 15.5411 78.4227 14.1839C78.4227 12.8267 79.1561 11.7264 80.0609 11.7264C80.9657 11.7264 81.6992 12.8267 81.6992 14.1839C81.6992 15.5411 80.9657 16.6413 80.0609 16.6413Z" fill="white"/>
      <path d="M71.4848 16.6413C70.58 16.6413 69.8465 15.5411 69.8465 14.1839C69.8465 12.8267 70.58 11.7264 71.4848 11.7264C72.3896 11.7264 73.123 12.8267 73.123 14.1839C73.123 15.5411 72.3896 16.6413 71.4848 16.6413Z" fill="white"/>
      <path d="M67.7444 27.484C67.7444 27.484 69.4124 23.6266 76.0996 23.6266C81.1038 23.6266 83.8145 27.484 83.8145 27.484" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    </g>
   
    <g class="mtx-survey-item" data-value="3">
      <path d="M132.284 37.805C142.292 37.805 150.424 29.6731 150.424 19.6647C150.424 9.65626 142.292 1.52441 132.284 1.52441C122.275 1.52441 114.143 9.65626 114.143 19.6647C114.143 29.6731 122.275 37.805 132.284 37.805Z" fill="#D4C828"/>
      <path d="M132.284 2.64125C122.901 2.64125 115.26 10.2816 115.26 19.6645C115.26 29.0474 122.901 36.6878 132.284 36.6878C141.667 36.6878 149.307 29.0474 149.307 19.6645C149.307 10.2816 141.667 2.64125 132.284 2.64125ZM132.284 0.407227C142.918 0.407227 151.541 9.03056 151.541 19.6645C151.541 30.2985 142.918 38.9218 132.284 38.9218C121.65 38.9218 113.026 30.2985 113.026 19.6645C113.026 9.03056 121.65 0.407227 132.284 0.407227Z" fill="#F9F297"/>
      <path d="M136.551 17.49C135.646 17.49 134.913 16.3898 134.913 15.0326C134.913 13.6754 135.646 12.5752 136.551 12.5752C137.456 12.5752 138.189 13.6754 138.189 15.0326C138.189 16.3898 137.456 17.49 136.551 17.49Z" fill="white"/>
      <path d="M127.989 17.49C127.084 17.49 126.35 16.3898 126.35 15.0326C126.35 13.6754 127.084 12.5752 127.989 12.5752C128.893 12.5752 129.627 13.6754 129.627 15.0326C129.627 16.3898 128.893 17.49 127.989 17.49Z" fill="white"/>
      <path d="M138.416 25.5475H131.967C126.963 25.5475 126.054 25.5475 126.054 25.5475" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    </g>
    
    <g class="mtx-survey-item" data-value="4">
      <path d="M188.797 37.805C198.806 37.805 206.938 29.6731 206.938 19.6647C206.938 9.65626 198.806 1.52441 188.797 1.52441C178.789 1.52441 170.657 9.65626 170.657 19.6647C170.657 29.6731 178.789 37.805 188.797 37.805Z" fill="#A5CE3A"/>
      <path d="M188.797 2.64125C179.415 2.64125 171.774 10.2816 171.774 19.6645C171.774 29.0474 179.415 36.6878 188.797 36.6878C198.18 36.6878 205.821 29.0474 205.821 19.6645C205.821 10.2816 198.18 2.64125 188.797 2.64125ZM188.797 0.407227C199.431 0.407227 208.055 9.03056 208.055 19.6645C208.055 30.2985 199.431 38.9218 188.797 38.9218C178.163 38.9218 169.54 30.2985 169.54 19.6645C169.54 9.03056 178.163 0.407227 188.797 0.407227Z" fill="#D7E48A"/>
      <path d="M193.09 17.4898C192.185 17.4898 191.452 16.3896 191.452 15.0324C191.452 13.6752 192.185 12.575 193.09 12.575C193.995 12.575 194.729 13.6752 194.729 15.0324C194.729 16.3896 193.995 17.4898 193.09 17.4898Z" fill="white"/>
      <path d="M184.512 17.4898C183.607 17.4898 182.874 16.3896 182.874 15.0324C182.874 13.6752 183.607 12.575 184.512 12.575C185.417 12.575 186.15 13.6752 186.15 15.0324C186.15 16.3896 185.417 17.4898 184.512 17.4898Z" fill="white"/>
      <path d="M196.828 24.4751C196.828 24.4751 195.16 28.3325 188.473 28.3325C183.469 28.3325 180.758 24.4751 180.758 24.4751" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    </g>
    
    <g class="mtx-survey-item" data-value="5">
      <path d="M245.311 37.8048C255.319 37.8048 263.451 29.673 263.451 19.6646C263.451 9.65614 255.319 1.52429 245.311 1.52429C235.302 1.52429 227.171 9.65614 227.171 19.6646C227.171 29.673 235.302 37.8048 245.311 37.8048Z" fill="#84C441"/>
      <path d="M245.311 2.64101C235.928 2.64101 228.288 10.2814 228.288 19.6643C228.288 29.0472 235.928 36.6875 245.311 36.6875C254.694 36.6875 262.334 29.0472 262.334 19.6643C262.334 10.2814 254.694 2.64101 245.311 2.64101ZM245.311 0.406982C255.945 0.406982 264.568 9.03031 264.568 19.6643C264.568 30.2982 255.945 38.9216 245.311 38.9216C234.677 38.9216 226.054 30.2982 226.054 19.6643C226.054 9.03031 234.677 0.406982 245.311 0.406982Z" fill="#C9DF86"/>
      <path d="M249.717 17.4898C248.812 17.4898 248.079 16.3896 248.079 15.0324C248.079 13.6752 248.812 12.575 249.717 12.575C250.622 12.575 251.355 13.6752 251.355 15.0324C251.355 16.3896 250.622 17.4898 249.717 17.4898Z" fill="white"/>
      <path d="M241.153 17.4898C240.248 17.4898 239.514 16.3896 239.514 15.0324C239.514 13.6752 240.248 12.575 241.153 12.575C242.058 12.575 242.791 13.6752 242.791 15.0324C242.791 16.3896 242.058 17.4898 241.153 17.4898Z" fill="white"/>
      <path d="M254.602 22.4196C254.602 22.4196 252.799 29.0918 245.561 29.0918C238.829 29.0918 236.014 22.4196 236.014 22.4196" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    </g>
  </svg>
</div>
<div class="mtx-survey-submit-holder">
  <button type="button" class="mtx-survey-submit-button" disabled>Submit</button>
</div>`;

const SURVEY_SUCCESSFULLY_LOGGED = 'mtx-survey-successfully-logged';

const getSurveyLogs = () => {
  const result = localStorage.getItem(SURVEY_SUCCESSFULLY_LOGGED);

  if (result === null) {
    return {};
  }

  return JSON.parse(result);
};

const getIsSurveyLogged = (appkey: string) => {
  const logs = getSurveyLogs();

  return logs[appkey] !== undefined;
};

const setSurveyLogged = (appkey: string, rating: number) => {
  const logs = getSurveyLogs();

  logs[appkey] = rating;

  return localStorage.setItem(SURVEY_SUCCESSFULLY_LOGGED, JSON.stringify(logs));
};

let surveyHolder: ReturnType<Document['createElement']> | null = null;

const hideSurvey = (holder: ReturnType<Document['createElement']> | null) => {
  if (holder === null) {
    return;
  }

  holder.classList.add('mtx-survey--close');
  setTimeout(() => document.body.contains(holder) && document.body.removeChild(holder), 350);
};

export const addSurvey = ({ appkey, sessionId, force = false, theme = 'white' }: AddSurveyProps) => {
  hideSurvey(surveyHolder);
  const isLogged = getIsSurveyLogged(appkey);

  /** Don't show the survey twice in automatic mode */
  if (isLogged && !force) {
    return;
  }

  surveyHolder = document.createElement('div');
  surveyHolder.setAttribute('class', `mtx-survey mtx-survey--${theme}`);
  surveyHolder.innerHTML = template;
  let rating: number | null = null;

  document.body.appendChild(surveyHolder);

  setTimeout(() => surveyHolder?.classList.add('mtx-survey--open'), 0);

  const items = [...surveyHolder.querySelectorAll('.mtx-survey-item')];
  const submitButton = surveyHolder.querySelector('.mtx-survey-submit-button');

  const setActiveItem = (item: Element) => {
    items.forEach(itemScore => {
      if (item !== itemScore) {
        itemScore.classList.remove('active');
      } else {
        itemScore.classList.add('active');
      }
    });
  };

  const handleItemClick = (item: Element) => {
    item.addEventListener('click', () => {
      surveyHolder?.classList.add('selected');
      rating = Number(item.getAttribute('data-value'));
      submitButton?.removeAttribute('disabled');
      setActiveItem(item);
    });
  };

  items.forEach(handleItemClick);

  submitButton?.addEventListener('click', async () => {
    if (rating === null) {
      return;
    }

    hideSurvey(surveyHolder);

    try {
      await sendMetricSurveysData({
        appkey,
        sessionId,
        rating,
      });

      setSurveyLogged(appkey, rating);
    } catch (e) {
      console.log(e);
    }
  });
};
