export const replaceEntities = (originalString: string, ...entities: (string | number)[]): string =>
  originalString.replace(/{{(entity\d+)}}/g, (match, entity) => {
    const entityIndex = parseInt(entity.replace('entity', ''), 10) - 1;
    if (entityIndex >= 0 && entityIndex < entities.length) {
      return entities[entityIndex].toString();
    }

    return match;
  });
