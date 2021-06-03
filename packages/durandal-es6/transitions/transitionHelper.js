/* eslint-disable func-names */
/* eslint-disable no-use-before-define */
import $ from "jquery";

const animationTypes = [
    "bounce",
    "bounceIn",
    "bounceInDown",
    "bounceInLeft",
    "bounceInRight",
    "bounceInUp",
    "bounceOut",
    "bounceOutDown",
    "bounceOutLeft",
    "bounceOutRight",
    "bounceOutUp",
    "fadeIn",
    "fadeInDown",
    "fadeInDownBig",
    "fadeInLeft",
    "fadeInLeftBig",
    "fadeInRight",
    "fadeInRightBig",
    "fadeInUp",
    "fadeInUpBig",
    "fadeOut",
    "fadeOutDown",
    "fadeOutDownBig",
    "fadeOutLeft",
    "fadeOutLeftBig",
    "fadeOutRight",
    "fadeOutRightBig",
    "fadeOutUp",
    "fadeOutUpBig",
    "flash",
    "flip",
    "flipInX",
    "flipInY",
    "flipOutX",
    "flipOutY",
    "hinge",
    "lightSpeedIn",
    "lightSpeedOut",
    "pulse",
    "rollIn",
    "rollOut",
    "rotateIn",
    "rotateInDownLeft",
    "rotateInDownRight",
    "rotateInUpLeft",
    "rotateInUpRight",
    "rotateOut",
    "rotateOutDownLeft",
    "rotateOutDownRight",
    "rotateOutUpLeft",
    "rotateOutUpRight",
    "shake",
    "swing",
    "tada",
    "wiggle",
    "wobble",
];

const App = {
    duration: 1000 * 0.3,
    create(receievedSettings) {
        const settings = ensureSettings(receievedSettings);
        return doTrans(settings);
    },
};

function animValue(type) {
    // eslint-disable-next-line eqeqeq
    return Object.prototype.toString.call(type) == "[object String]" ? type : animationTypes[type];
}

function ensureSettings(receivedSettings) {
    const settings = receivedSettings;
    settings.inAnimation = settings.inAnimation || "fadeInRight";
    settings.outAnimation = settings.outAnimation || "fadeOut";
    return settings;
}

function doTrans(settings) {
    const { activeView } = settings;
    const newChild = settings.child;
    const outAn = animValue(settings.outAnimation);
    const inAn = animValue(settings.inAnimation);
    let $previousView;
    let $newView = $(newChild).removeClass(outAn); // just need to remove outAn here, keeping the animated class so we don't get a "flash"

    if (newChild) {
        $newView = $(newChild);
        if (settings.activeView) {
            return outTransition(inTransition);
        }

        return inTransition();
    }

    function outTransition(callback) {
        $previousView = $(activeView);
        $previousView.addClass("animated");
        $previousView.addClass(outAn);

        return new Promise((resolve) => {
            setTimeout(() => {
                if (callback) {
                    resolve(callback());
                }
            }, App.duration);
        });
    }

    function inTransition() {
        if ($previousView) {
            $previousView.css("display", "none");
        }
        settings.triggerAttach();

        $newView.addClass("animated"); // moved the adding of the animated class here so it keeps it together
        $newView.addClass(inAn);
        $newView.css("display", "");

        return new Promise((resolve) => {
            setTimeout(() => {
                $newView.removeClass(`${inAn} animated`); // just need to remove inAn here, that's all we'll have
                resolve(true);
            }, App.duration);
        });
    }
}

export default App;
