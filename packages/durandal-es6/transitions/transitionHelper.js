/* eslint-disable no-use-before-define */
import $ from "jquery";
import "animate.css/animate.compat.css";
import system from "../core/system";

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
    "roateOutUpRight",
    "shake",
    "swing",
    "tada",
    "wiggle",
    "wobble",
];

const App = {
    duration: 1000 * 0.35, // seconds
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
    const $newView = $(newChild).removeClass([outAn, inAn]).addClass("animated");

    return system
        .defer((dfd) => {
            if (newChild) {
                startTransition();
            } else {
                endTransistion();
            }

            function startTransition() {
                if (settings.activeView) {
                    outTransition(inTransition);
                } else {
                    inTransition();
                }
            }

            function outTransition(callback) {
                $previousView = $(activeView);
                $previousView.addClass("animated");
                $previousView.addClass(outAn);
                setTimeout(function () {
                    if (callback) {
                        callback();
                        endTransistion();
                    }
                }, App.duration);
            }

            function inTransition() {
                settings.triggerAttach();
                $newView.css("display", "");
                $newView.addClass(inAn);

                setTimeout(() => {
                    $newView.removeClass(`${inAn} ${outAn} animated`);
                    endTransistion();
                }, App.duration);
            }

            function endTransistion() {
                dfd.resolve();
            }
        })
        .promise();
}

export default App;
