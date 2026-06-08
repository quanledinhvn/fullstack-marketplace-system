import type { IAdminDocumentResponse } from '@app/shared';
import { useEffect, useReducer } from 'react';
import { listAllDocuments } from '../api/admin.api';

type State = { documents: IAdminDocumentResponse[]; loading: boolean };

type Action = { type: 'loading' } | { type: 'loaded'; documents: IAdminDocumentResponse[] };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'loading':
			return { ...state, loading: true };

		case 'loaded':
			return { documents: action.documents, loading: false };
	}
}

export function useAdminDocuments(status?: string) {
	const [state, dispatch] = useReducer(reducer, { documents: [], loading: false });

	useEffect(() => {
		let cancelled = false;

		dispatch({ type: 'loading' });

		listAllDocuments(status).then((docs) => {
			if (!cancelled) dispatch({ type: 'loaded', documents: docs });
		});

		return () => {
			cancelled = true;
		};
	}, [status]);

	return state;
}
