/* eslint-disable func-names */
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
    duration: 1000 * 0.3, // seconds - set to 0 if user has accessibility option for reduced animation
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

    return system
        .defer(function (dfd) {
            if (newChild) {
                $newView = $(newChild);
                if (settings.activeView) {
                    outTransition(inTransition);
                } else {
                    inTransition();
                }
            }

            function outTransition(callback) {
                $previousView = $(activeView);
                $previousView.addClass("animated slower");
                $previousView.addClass(outAn);
                setTimeout(function setTimeout() {
                    if (callback) {
                        callback();
                    }
                }, App.duration);
            }

            function inTransition() {
                if ($previousView) {
                    $previousView.css("display", "none");
                }
                settings.triggerAttach();

                $newView.addClass("animated slower"); // moved the adding of the animated class here so it keeps it together
                $newView.addClass(inAn);
                $newView.css("display", "");

                setTimeout(function setTimeout() {
                    $newView.removeClass(`${inAn} animated slower`); // just need to remove inAn here, that's all we'll have
                    dfd.resolve(true);
                }, App.duration);
            }
        })
        .promise();
}

export default App;
