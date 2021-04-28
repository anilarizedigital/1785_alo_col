define([
    'core/js/adapt',
    './checklistView',
    'core/js/models/itemsQuestionModel'
], function(Adapt, ChecklistView, ItemsQuestionModel) {

    return Adapt.register("checklist", {
        view: ChecklistView,
        // Extend ItemsQuestionModel to distinguish McqModel in
        // the inheritance chain and allow targeted model extensions.
        model: ItemsQuestionModel.extend({})
    });

});
