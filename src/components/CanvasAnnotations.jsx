import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import SanitizedHtml from '../containers/SanitizedHtml';
import { ScrollTo } from './ScrollTo';
import { MiradorMenuButton } from './MiradorMenuButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import copy from 'copy-to-clipboard';

/**
 * CanvasAnnotations ~
 */
export function CanvasAnnotations({
  annotations = [],
  index,
  label,
  selectedAnnotationId = undefined,
  enableAnnotationCopy = false,
  annotationCopyConfirmDuration = 2000,
  totalSize,
  listContainerComponent = 'li',
  htmlSanitizationRuleSet = 'iiif',
  hoveredAnnotationIds = [],
  containerRef = undefined,
  deselectAnnotation,
  selectAnnotation,
  windowId,
  hoverAnnotation,
}) {
  const { t } = useTranslation();
  const [copiedAnnotationId, setCopiedAnnotationId] = useState(null);
  const handleClick = useCallback(
    (_event, annotation) => {
      if (selectedAnnotationId === annotation.id) {
        deselectAnnotation(windowId, annotation.id);
      } else {
        selectAnnotation(windowId, annotation.id);
      }
    },
    [windowId, deselectAnnotation, selectAnnotation, selectedAnnotationId],
  );

  const handleAnnotationHover = useCallback(
    (annotation) => {
      hoverAnnotation(windowId, [annotation.id]);
    },
    [hoverAnnotation, windowId],
  );

  const handleAnnotationBlur = useCallback(() => {
    hoverAnnotation(windowId, []);
  }, [hoverAnnotation, windowId]);

  const handleCopyClick = useCallback(
    (annotation) => (e) => {
      e.stopPropagation();
      copy(annotation.content);
      setCopiedAnnotationId(annotation.id);
      setTimeout(() => setCopiedAnnotationId(null), annotationCopyConfirmDuration);
    },
    [annotationCopyConfirmDuration],
  );

  if (annotations.length === 0) return null;

  return (
    <>
      <Typography sx={{ paddingLeft: 2, paddingRight: 1, paddingTop: 2 }} variant="overline">
        {t('annotationCanvasLabel', { context: `${index + 1}/${totalSize}`, label })}
      </Typography>
      <MenuList autoFocusItem variant="selectedMenu">
        {annotations.map((annotation) => (
          <ScrollTo
            containerRef={containerRef}
            key={`${annotation.id}-scroll`}
            offsetTop={96} // offset for the height of the form above
            scrollTo={selectedAnnotationId === annotation.id}
            selected={selectedAnnotationId === annotation.id}
          >
            <MenuItem
              component={listContainerComponent}
              variant="multiline"
              divider
              sx={{
                '&:hover,&:focus': {
                  backgroundColor: 'action.hover',
                },
                backgroundColor: hoveredAnnotationIds.includes(annotation.id) ? 'action.hover' : '',
              }}
              key={annotation.id}
              annotationid={annotation.id}
              onClick={(e) => handleClick(e, annotation)}
              onFocus={() => handleAnnotationHover(annotation)}
              onBlur={handleAnnotationBlur}
              onMouseEnter={() => handleAnnotationHover(annotation)}
              onMouseLeave={handleAnnotationBlur}
            >
              <Box sx={{ display: 'block' }}>
                {enableAnnotationCopy && selectedAnnotationId === annotation.id && (
                  <MiradorMenuButton
                    aria-label={copiedAnnotationId === annotation.id ? t('copiedAnnotationText') : t('copyAnnotationText')}
                    sx={{ float: 'right', padding: '0', marginLeft: '0', marginBottom: '0' }}
                    size="small"
                    onClick={handleCopyClick(annotation)}
                  >
                    {copiedAnnotationId === annotation.id ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </MiradorMenuButton>
                )}
                <ListItemText
                  primaryTypographyProps={{ variant: 'body2' }}
                  primary={<SanitizedHtml ruleSet={htmlSanitizationRuleSet} htmlString={annotation.content} />}
                  secondary={annotation.tags.map((tag) => (
                    <Chip component="span" size="small" variant="outlined" label={tag} id={tag} key={tag.toString()} />
                  ))}
                />
              </Box>
            </MenuItem>
          </ScrollTo>
        ))}
      </MenuList>
    </>
  );
}

CanvasAnnotations.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }),
  ),
  containerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })]),
  deselectAnnotation: PropTypes.func.isRequired,
  hoverAnnotation: PropTypes.func.isRequired,
  hoveredAnnotationIds: PropTypes.arrayOf(PropTypes.string),
  htmlSanitizationRuleSet: PropTypes.string,
  index: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  listContainerComponent: PropTypes.elementType,
  selectAnnotation: PropTypes.func.isRequired,
  selectedAnnotationId: PropTypes.string,
  enableAnnotationCopy: PropTypes.bool,
  annotationCopyConfirmDuration: PropTypes.number,
  totalSize: PropTypes.number.isRequired,
  windowId: PropTypes.string.isRequired,
};
