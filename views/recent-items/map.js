function(doc) {
  if (doc.created_at) {
      var p = doc.profile || {};
      emit(doc.created_at, {
          id:doc._id,
          text_result:doc.text_result,
          images:doc._attachments
      });
  }
};
